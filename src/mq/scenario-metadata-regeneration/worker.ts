import { Worker } from "bullmq";
import { and, eq } from "drizzle-orm";
import { zodTextFormat } from "openai/helpers/zod";

import { generateScenarioMetadataPrompt } from "@/ai/prompts/builders/generate-scenario-metadata";
import { systemPrompt } from "@/ai/prompts/builders/system-prompt";
import { polzaAI } from "@/ai/providers/open-ai/polza-ai";
import { db } from "@/db";
import { generationLog, scenario, scenarioMetadata } from "@/db/schema";
import { creditsPricing } from "@/domains/credits/constants/credits-pricing";
import { chargeCredits } from "@/domains/credits/services/charge-credits";
import { getCreditsBalance } from "@/domains/credits/services/get-credits-balance";
import { scenarioMetadataItemGeneratedSchema } from "@/domains/scenarios/schemas/entities/scenario-metadata";
import { redis } from "@/lib/redis";
import { z } from "@/lib/zod";
import { envs } from "@/shared/constants/common/envs";

import {
  SCENARIO_METADATA_REGENERATION_QUEUE_NAME,
  type ScenarioMetadataRegenerationJobData,
} from "./queue";

export const scenarioMetadataRegenerationWorker =
  new Worker<ScenarioMetadataRegenerationJobData>(
    SCENARIO_METADATA_REGENERATION_QUEUE_NAME,
    async (job) => {
      const { scenarioId, platformId, prompt: userPrompt } = job.data;

      console.log("Scenario metadata regeneration worker started", job.data);

      try {
        const foundScenario = await db.query.scenario.findFirst({
          where: (scenario, { eq }) => eq(scenario.id, scenarioId),
          with: {
            profile: true,
            template: true,
            videoType: true,
            videoDuration: true,
            scenarioToPlatform: {
              with: { platform: true },
            },
            scenarioToTone: {
              with: { tone: true },
            },
          },
        });

        if (!foundScenario) {
          console.warn(`Scenario with id ${scenarioId} not found`);

          return;
        }

        const targetPlatform = foundScenario.scenarioToPlatform.find(
          ({ platformId: itemPlatformId }) => itemPlatformId === platformId,
        )?.platform;

        if (!targetPlatform) {
          throw new Error("Target platform is not linked to the scenario");
        }

        const foundMetadata = await db.query.scenarioMetadata.findFirst({
          where: (scenarioMetadata, { and, eq }) =>
            and(
              eq(scenarioMetadata.scenarioId, scenarioId),
              eq(scenarioMetadata.platformId, platformId),
            ),
        });

        if (!foundMetadata) {
          throw new Error(
            "Scenario metadata for the target platform not found",
          );
        }

        const creditsBalance = await getCreditsBalance({
          userId: foundScenario.userId,
        });

        if (creditsBalance < creditsPricing["scenario-metadata"]) {
          throw new Error("Insufficient credits to complete the operation");
        }

        await db.transaction(async (tx) => {
          await Promise.all([
            tx
              .update(scenario)
              .set({ metadataStatus: "generation" })
              .where(eq(scenario.id, scenarioId)),
            tx
              .update(scenarioMetadata)
              .set({ status: "generation" })
              .where(eq(scenarioMetadata.id, foundMetadata.id)),
          ]);
        });

        const prompt = generateScenarioMetadataPrompt({
          userPrompt,
          context: {
            scenarioName: foundScenario.name,
            scenarioDescription: foundScenario.description,
            scenarioTargetAudience: foundScenario.targetAudience,
            scenarioTemplateName: foundScenario.template?.name,
            scenarioTemplateDescription: foundScenario.template?.description,
            scenarioProfileName: foundScenario.profile?.name,
            scenarioProfileDescription: foundScenario.profile?.description,
            scenarioVideoTypeName: foundScenario.videoType?.name,
            scenarioVideoDurationName: foundScenario.videoDuration?.name,
            scenarioTones: foundScenario.scenarioToTone.map(
              ({ tone }) => tone.name,
            ),
          },
          platforms: [
            {
              id: targetPlatform.id,
              name: targetPlatform.name,
              slug: targetPlatform.slug,
              metadataDetails: targetPlatform.metadataDetails,
            },
          ],
        });

        const { output_parsed: generatedMetadataObject, usage } =
          await polzaAI.responses.parse({
            model: envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
            temperature: 0.6,
            input: [
              { role: "system", content: systemPrompt() },
              {
                role: "user",
                content: prompt,
              },
            ],
            text: {
              format: zodTextFormat(
                z.object({
                  items: z.array(scenarioMetadataItemGeneratedSchema),
                }),
                "scenarioMetadata",
              ),
            },
          });

        if (!generatedMetadataObject) {
          throw new Error("Failed to regenerate scenario metadata");
        }

        const generatedItem = generatedMetadataObject.items.find(
          (item) => item.platformId === platformId,
        );

        if (!generatedItem) {
          throw new Error(
            "Generated metadata does not contain target platform",
          );
        }

        await db.transaction(async (tx) => {
          await tx
            .update(scenario)
            .set({ metadataStatus: "ready" })
            .where(eq(scenario.id, scenarioId));

          await tx
            .update(scenarioMetadata)
            .set({
              status: "ready",
              title: generatedItem.title,
              body: generatedItem.body,
              tags: generatedItem.tags,
            })
            .where(eq(scenarioMetadata.id, foundMetadata.id));

          await Promise.all([
            tx.insert(generationLog).values({
              entity: "scenario-metadata",
              entityId: scenarioId,
              prompt,
              model: envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
              tokens: usage?.total_tokens ?? 0,
            }),
            chargeCredits({
              userId: foundScenario.userId,
              entity: "scenario-metadata",
              entityId: scenarioId,
              totalTokens: usage?.total_tokens ?? 0,
              transaction: tx,
            }),
          ]);
        });
      } catch (error) {
        try {
          await db.transaction(async (tx) => {
            await tx
              .update(scenario)
              .set({ metadataStatus: "failed" })
              .where(eq(scenario.id, scenarioId));

            await tx
              .update(scenarioMetadata)
              .set({ status: "failed" })
              .where(
                and(
                  eq(scenarioMetadata.scenarioId, scenarioId),
                  eq(scenarioMetadata.platformId, platformId),
                ),
              );
          });
        } catch (updateError) {
          console.error(
            "Failed to update scenario metadata regeneration status",
            updateError,
          );
        }

        throw error;
      }
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

scenarioMetadataRegenerationWorker.on("error", (error) => {
  console.error("Scenario metadata regeneration worker error", error);
});

scenarioMetadataRegenerationWorker.on("failed", (job, error) => {
  console.error(
    "Scenario metadata regeneration worker failed",
    job?.toJSON(),
    error,
  );
});

scenarioMetadataRegenerationWorker.on("completed", (job) => {
  console.log("Scenario metadata regeneration worker completed", job.id);
});
