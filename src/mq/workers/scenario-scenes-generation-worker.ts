import { generateText, Output } from "ai";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import * as z from "zod";

import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import { aiGenerationLog, scenarioChapter, scenarioScene } from "@/db/schema";
import { polza } from "@/lib/ai/providers/polza";
import { redis } from "@/lib/redis";
import { generateScenarioScenesPrompt } from "@/prompts/scenarios/generate-scenario-scenes-prompt";
import { systemPrompt } from "@/prompts/system/system-prompt";
import { scenarioSceneGeneratedSchema } from "@/schemas/entities/scenarios/entities/scenario-scene";

import { enqueueScenarioSceneComponentsGeneration } from "../queues/scenario-scene-components-generation-queue";
import {
  SCENARIO_SCENES_GENERATION_QUEUE_NAME,
  type ScenarioScenesGenerationJobData,
} from "../queues/scenario-scenes-generation-queue";

export const scenarioScenesGenerationWorker =
  new Worker<ScenarioScenesGenerationJobData>(
    SCENARIO_SCENES_GENERATION_QUEUE_NAME,
    async (job) => {
      const { scenarioChapterId } = job.data;

      const foundChapter = await db.query.scenarioChapter.findFirst({
        where: (scenarioChapter, { eq }) =>
          eq(scenarioChapter.id, scenarioChapterId),
        with: {
          scenarioVersion: {
            with: {
              scenario: {
                with: {
                  scenarioToTone: {
                    with: { tone: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!foundChapter) {
        return;
      }

      const { scenarioVersion } = foundChapter;

      await db
        .update(scenarioChapter)
        .set({ status: "generation" })
        .where(eq(scenarioChapter.id, scenarioChapterId));

      const prompt = generateScenarioScenesPrompt({
        context: {
          scenarioName: scenarioVersion.scenario.name,
          scenarioDescription: scenarioVersion.scenario.description,
          scenarioTargetAudience: scenarioVersion.scenario.targetAudience,
          scenarioTones: scenarioVersion.scenario.scenarioToTone.map(
            ({ tone }) => tone.name,
          ),
          chapterName: foundChapter.name,
          chapterDescription: foundChapter.description,
          chapterStartTime: foundChapter.startTime,
          chapterEndTime: foundChapter.endTime,
        },
      });

      try {
        const { output: generatedScenarioScenes, usage } = await generateText({
          model: polza.languageModel(envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL),
          output: Output.object({
            schema: z.array(scenarioSceneGeneratedSchema),
          }),
          system: systemPrompt(),
          prompt,
        });

        const createdScenarioScenes = await db.transaction(async (tx) => {
          const createdScenarioScenes = await tx
            .insert(scenarioScene)
            .values(
              generatedScenarioScenes.map((scene) => ({
                scenarioChapterId,
                name: scene.name,
                description: scene.description ?? null,
                startTime: scene.startTime,
                endTime: scene.endTime,
                badges: scene.badges ?? null,
                status: "ready" as const,
              })),
            )
            .returning();

          if (createdScenarioScenes.length > 0) {
            await tx.insert(aiGenerationLog).values(
              createdScenarioScenes.map((scene) => ({
                entityType: "scenario-scene" as const,
                entityId: scene.id,
                prompt,
                model: envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
                tokens: usage?.totalTokens ?? 0,
              })),
            );
          } else {
            console.warn(`No scenario scenes generated`);
          }

          await tx
            .update(scenarioChapter)
            .set({ status: "ready" })
            .where(eq(scenarioChapter.id, scenarioChapterId));

          return createdScenarioScenes;
        });

        await Promise.all(
          createdScenarioScenes.map((scene) =>
            enqueueScenarioSceneComponentsGeneration({
              userId: scenarioVersion.scenario.userId,
              scenarioVersionId: scenarioVersion.id,
              scenarioChapterId: scene.scenarioChapterId,
              scenarioSceneId: scene.id,
            }),
          ),
        );
      } catch (error) {
        await db
          .update(scenarioChapter)
          .set({ status: "failed" })
          .where(eq(scenarioChapter.id, scenarioChapterId));

        throw error;
      }
    },
    {
      connection: redis,
    },
  );
