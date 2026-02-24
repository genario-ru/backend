import { generateText, Output } from "ai";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import * as z from "zod";

import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import { aiGenerationLog, scenarioChapter, scenarioScene } from "@/db/schema";
import { routerAI } from "@/lib/ai/providers/router-ai";
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

      console.log("Scenario scenes generation worker started", job.data);

      try {
        const foundScenarioChapter = await db.query.scenarioChapter.findFirst({
          where: (scenarioChapter, { eq }) =>
            eq(scenarioChapter.id, scenarioChapterId),
          with: {
            scenarioVersion: {
              with: {
                scenario: true,
                chapters: { with: { scenes: true } },
              },
            },
          },
        });

        if (!foundScenarioChapter) {
          console.warn(
            `Scenario chapter with id ${scenarioChapterId} was not found`,
          );

          return;
        }

        await db
          .update(scenarioChapter)
          .set({ status: "generation" })
          .where(eq(scenarioChapter.id, scenarioChapterId));

        const prompt = generateScenarioScenesPrompt({
          context: {
            scenarioName: foundScenarioChapter.scenarioVersion.scenario.name,
            scenarioDescription:
              foundScenarioChapter.scenarioVersion.scenario.description,
            scenarioTargetAudience:
              foundScenarioChapter.scenarioVersion.scenario.targetAudience,
            chapterName: foundScenarioChapter.name,
            chapterDescription: foundScenarioChapter.description,
            chapterStartTime: foundScenarioChapter.startTime,
            chapterEndTime: foundScenarioChapter.endTime,
            previousGeneratedChapters:
              foundScenarioChapter.scenarioVersion.chapters,
          },
        });

        const {
          output: { scenes: generatedScenarioScenes },
          usage,
        } = await generateText({
          model: routerAI.languageModel(envs.ROUTER_AI_STRUCTURED_OUTPUT_MODEL),
          output: Output.object({
            schema: z.object({
              scenes: z.array(scenarioSceneGeneratedSchema),
            }),
          }),
          temperature: 0.2,
          system: systemPrompt(),
          prompt,
          onFinish: (data) => {
            console.log(
              "Scenario scenes generation finished",
              data.response.id,
            );
          },
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

        createdScenarioScenes.map((scene) =>
          enqueueScenarioSceneComponentsGeneration({
            scenarioSceneId: scene.id,
          }),
        );
      } catch (error) {
        console.error("Scenario scenes generation worker error", error);

        try {
          await db
            .update(scenarioChapter)
            .set({ status: "failed" })
            .where(eq(scenarioChapter.id, scenarioChapterId));
        } catch (updateError) {
          console.error(
            "Scenario scenes generation worker failed to update status",
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

scenarioScenesGenerationWorker.on("error", (error) => {
  console.error("Scenario scenes generation worker error", error);
});

scenarioScenesGenerationWorker.on("failed", (job, error) => {
  console.error(
    "Scenario scenes generation worker failed",
    job?.toJSON(),
    error,
  );
});

scenarioScenesGenerationWorker.on("completed", (job) => {
  console.log("Scenario scenes generation worker completed", job.id);
});
