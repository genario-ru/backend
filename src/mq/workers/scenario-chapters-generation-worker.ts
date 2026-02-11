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
      const { scenarioVersionId, userId } = job.data;

      const foundScenarioVersion = await db.query.scenarioVersion.findFirst({
        where: (scenarioVersion, { eq }) =>
          eq(scenarioVersion.id, scenarioVersionId),
        with: {
          scenario: {
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
          },
        },
      });

      if (!foundScenarioVersion) {
        return;
      }

      const { scenario } = foundScenarioVersion;

      await db
        .update(scenarioVersion)
        .set({ status: "generation" })
        .where(eq(scenarioVersion.id, scenarioVersionId));

      const prompt = generateScenarioChaptersPrompt({
        context: {
          scenarioName: scenario.name,
          scenarioDescription: scenario.description,
          scenarioTargetAudience: scenario.targetAudience,
          scenarioTemplateName: scenario.template?.name,
          scenarioTemplateDescription: scenario.template?.description,
          scenarioProfileName: scenario.profile?.name,
          scenarioProfileDescription: scenario.profile?.description,
          scenarioPlatformName: scenario.platform?.name,
          scenarioVideoTypeName: scenario.videoType?.name,
          scenarioVideoDurationName: scenario.videoDuration?.name,
          scenarioMinimumDurationSeconds: scenario.videoDuration?.minSeconds,
          scenarioMaximumDurationSeconds: scenario.videoDuration?.maxSeconds,
          scenarioTones: scenario.scenarioToTone.map(({ tone }) => tone.name),
        },
      });

      try {
        const { output: generatedChapters, usage } = await generateText({
          model: polza.languageModel(envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL),
          output: Output.object({
            schema: z.array(scenarioChapterGeneratedSchema),
          }),
          system: systemPrompt(),
          prompt,
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
                status: "generation" as const,
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

        await Promise.all(
          scenarioChapters.map((chapter) =>
            enqueueScenarioScenesGeneration({
              userId,
              scenarioVersionId,
              scenarioChapterId: chapter.id,
            }),
          ),
        );
      } catch (error) {
        await db
          .update(scenarioVersion)
          .set({ status: "failed" })
          .where(eq(scenarioVersion.id, scenarioVersionId));

        throw error;
      }
    },
    {
      connection: redis,
    },
  );
