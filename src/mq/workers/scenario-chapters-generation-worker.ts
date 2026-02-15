import { generateText, Output } from "ai";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import * as z from "zod";

import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import { aiGenerationLog, scenarioChapter, scenarioVersion } from "@/db/schema";
import { polza } from "@/lib/ai/providers/polza";
import { redis } from "@/lib/redis";
import { generateScenarioChaptersPrompt } from "@/prompts/scenarios/generate-scenario-chapters-prompt";
import { systemPrompt } from "@/prompts/system/system-prompt";
import { scenarioChapterGeneratedSchema } from "@/schemas/entities/scenarios/entities/scenario-chapter";

import {
  SCENARIO_CHAPTERS_GENERATION_QUEUE_NAME,
  type ScenarioChaptersGenerationJobData,
} from "../queues/scenario-chapters-generation-queue";
import { enqueueScenarioScenesGeneration } from "../queues/scenario-scenes-generation-queue";

export const scenarioChaptersGenerationWorker =
  new Worker<ScenarioChaptersGenerationJobData>(
    SCENARIO_CHAPTERS_GENERATION_QUEUE_NAME,
    async (job) => {
      const { scenarioId, scenarioVersionId } = job.data;

      console.log("Scenario chapters generation worker started", job.data);

      try {
        const foundScenario = await db.query.scenario.findFirst({
          where: (scenario, { eq }) => eq(scenario.id, scenarioId),
          with: {
            profile: true,
            template: true,
            platform: true,
            videoType: true,
            videoDuration: true,
            scenarioToTone: {
              with: { tone: true },
            },
          },
        });

        if (!foundScenario) {
          return;
        }

        await db
          .update(scenarioVersion)
          .set({ status: "generation" })
          .where(eq(scenarioVersion.id, scenarioVersionId));

        const prompt = generateScenarioChaptersPrompt({
          context: {
            scenarioName: foundScenario.name,
            scenarioDescription: foundScenario.description,
            scenarioTargetAudience: foundScenario.targetAudience,
            scenarioTemplateName: foundScenario.template?.name,
            scenarioTemplateDescription: foundScenario.template?.description,
            scenarioProfileName: foundScenario.profile?.name,
            scenarioProfileDescription: foundScenario.profile?.description,
            scenarioPlatformName: foundScenario.platform?.name,
            scenarioVideoTypeName: foundScenario.videoType?.name,
            scenarioVideoDurationName: foundScenario.videoDuration?.name,
            scenarioMinimumDurationSeconds:
              foundScenario.videoDuration?.minSeconds,
            scenarioMaximumDurationSeconds:
              foundScenario.videoDuration?.maxSeconds,
            scenarioTones: foundScenario.scenarioToTone.map(
              ({ tone }) => tone.name,
            ),
          },
        });

        const {
          output: { chapters: generatedChapters },
          usage,
        } = await generateText({
          model: polza.languageModel(envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL),
          output: Output.object({
            schema: z.object({
              chapters: z.array(scenarioChapterGeneratedSchema),
            }),
          }),
          system: systemPrompt(),
          prompt,
          onFinish: (data) => {
            console.log("Scenario chapters generation finished", data.response);
          },
        });

        const scenarioChapters = await db.transaction(async (tx) => {
          const createdScenarioChapters = await tx
            .insert(scenarioChapter)
            .values(
              generatedChapters.map((chapter) => ({
                scenarioVersionId,
                name: chapter.name,
                description: chapter.description,
                startTime: chapter.startTime,
                endTime: chapter.endTime,
              })),
            )
            .returning();

          if (createdScenarioChapters.length > 0) {
            await tx.insert(aiGenerationLog).values(
              createdScenarioChapters.map((chapter) => ({
                entityType: "scenario-chapter" as const,
                entityId: chapter.id,
                prompt,
                model: envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
                tokens: usage?.totalTokens ?? 0,
              })),
            );
          } else {
            console.warn(`No scenario chapters generated`);
          }

          await tx
            .update(scenarioVersion)
            .set({ status: "ready" })
            .where(eq(scenarioVersion.id, scenarioVersionId));

          return createdScenarioChapters;
        });

        scenarioChapters.map((chapter) =>
          enqueueScenarioScenesGeneration({
            scenarioChapterId: chapter.id,
          }),
        );
      } catch (error) {
        console.error("Scenario chapters generation worker error", error);

        try {
          await db
            .update(scenarioVersion)
            .set({ status: "failed" })
            .where(eq(scenarioVersion.id, scenarioVersionId));
        } catch (updateError) {
          console.error(
            "Scenario chapters generation worker failed to update status",
            updateError,
          );
        }

        throw error;
      }
    },
    {
      connection: redis,
    },
  );

scenarioChaptersGenerationWorker.on("error", (error) => {
  console.error("Scenario chapters generation worker error", error);
});

scenarioChaptersGenerationWorker.on("failed", (job, error) => {
  console.error(
    "Scenario chapters generation worker failed",
    job?.toJSON(),
    error,
  );
});

scenarioChaptersGenerationWorker.on("completed", (job) => {
  console.log("Scenario chapters generation worker completed", job.id);
});
