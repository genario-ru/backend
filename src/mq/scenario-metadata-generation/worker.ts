import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
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
import { env } from "@/env";
import { redis } from "@/lib/redis";
import { z } from "@/lib/zod";
import { getSafeJobLogContext } from "@/shared/utils/mq/get-safe-job-log-context";
import { isFinalJobFailure } from "@/shared/utils/mq/is-final-job-failure";

import {
  SCENARIO_METADATA_GENERATION_QUEUE_NAME,
  type ScenarioMetadataGenerationJobData,
} from "./queue";

export const scenarioMetadataGenerationWorker =
  new Worker<ScenarioMetadataGenerationJobData>(
    SCENARIO_METADATA_GENERATION_QUEUE_NAME,
    async (job) => {
      const { scenarioId } = job.data;

      console.log("Worker генерации метаданных сценария запущен", {
        scenarioId,
        jobId: job.id,
      });

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
        console.warn(`Сценарий с id ${scenarioId} не найден`);

        return;
      }

      const platforms = foundScenario.scenarioToPlatform.map(
        ({ platform }) => platform,
      );

      if (platforms.length === 0) {
        throw new Error(
          "У сценария нет привязанных платформ для генерации метаданных",
        );
      }

      const creditsBalance = await getCreditsBalance({
        userId: foundScenario.userId,
      });

      if (creditsBalance < creditsPricing["scenario-metadata"]) {
        throw new Error("Недостаточно кредитов для выполнения операции");
      }

      await db
        .update(scenario)
        .set({ metadataStatus: "generation" })
        .where(eq(scenario.id, scenarioId));

      const prompt = generateScenarioMetadataPrompt({
        context: {
          scenarioName: foundScenario.name,
          scenarioDescription: foundScenario.description,
          scenarioTargetAudience: foundScenario.targetAudience,
          scenarioTemplateName: foundScenario.template?.name,
          scenarioTemplateDescription: foundScenario.template?.description,
          scenarioTemplateDetails: foundScenario.template?.details,
          scenarioProfileName: foundScenario.profile?.name,
          scenarioProfileDescription: foundScenario.profile?.description,
          scenarioVideoTypeName: foundScenario.videoType?.name,
          scenarioVideoDurationName: foundScenario.videoDuration?.name,
          scenarioTones: foundScenario.scenarioToTone.map(
            ({ tone }) => tone.name,
          ),
        },
        platforms: platforms.map((platform) => ({
          id: platform.id,
          name: platform.name,
          slug: platform.slug,
          metadataDetails: platform.metadataDetails,
        })),
      });

      const { output_parsed: generatedMetadataObject, usage } =
        await polzaAI.responses.parse({
          model: env.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
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
        throw new Error("Не удалось сгенерировать метаданные сценария");
      }

      console.log("Метаданные сценария успешно сгенерированы");

      const allowedPlatformIds = new Set(
        platforms.map((platform) => platform.id),
      );
      const itemsByPlatformId = new Map<
        string,
        (typeof generatedMetadataObject.items)[number]
      >();

      for (const item of generatedMetadataObject.items) {
        if (!allowedPlatformIds.has(item.platformId)) continue;
        if (itemsByPlatformId.has(item.platformId)) continue;

        itemsByPlatformId.set(item.platformId, item);
      }

      if (itemsByPlatformId.size === 0) {
        throw new Error(
          "Сгенерированные метаданные не содержат записей для платформ сценария",
        );
      }

      const itemsToInsert = Array.from(itemsByPlatformId.values()).map(
        (item) => ({
          scenarioId,
          platformId: item.platformId,
          status: "ready" as const,
          title: item.title,
          body: item.body,
          tags: item.tags,
        }),
      );

      await db.transaction(async (tx) => {
        await tx
          .delete(scenarioMetadata)
          .where(eq(scenarioMetadata.scenarioId, scenarioId));

        await tx.insert(scenarioMetadata).values(itemsToInsert);

        await Promise.all([
          tx.insert(generationLog).values({
            entity: "scenario-metadata",
            entityId: scenarioId,
            model: env.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
            tokens: usage?.total_tokens ?? 0,
          }),
          await chargeCredits({
            userId: foundScenario.userId,
            entity: "scenario-metadata",
            entityId: scenarioId,
            totalTokens: usage?.total_tokens ?? 0,
            tx,
          }),
        ]);

        await tx
          .update(scenario)
          .set({ metadataStatus: "ready" })
          .where(eq(scenario.id, scenarioId));
      });
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

scenarioMetadataGenerationWorker.on("error", (error) => {
  console.error("Worker генерации метаданных сценария упал с ошибкой", error);
});

scenarioMetadataGenerationWorker.on("failed", async (job, error) => {
  console.error(
    "Worker генерации метаданных сценария упал с ошибкой",
    getSafeJobLogContext(job),
    error,
  );

  const isFinalFailure = await isFinalJobFailure(job);

  if (!job || !isFinalFailure) {
    return;
  }

  try {
    await db
      .update(scenario)
      .set({ metadataStatus: "failed" })
      .where(eq(scenario.id, job.data.scenarioId));
  } catch (updateError) {
    console.error(
      "Не удалось обновить статус метаданных сценария",
      updateError,
    );
  }
});

scenarioMetadataGenerationWorker.on("completed", (job) => {
  console.log("Worker генерации метаданных сценария отработал успешно", job.id);
});
