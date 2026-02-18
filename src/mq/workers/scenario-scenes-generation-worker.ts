import { generateText, Output } from "ai";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import * as z from "zod";

import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import { aiGenerationLog, scenarioChapter, scenarioScene } from "@/db/schema";
import { polza } from "@/lib/ai/providers/polza";
import { redis } from "@/lib/redis";
import { generateScenarioScenesPrompt } from "@/prompts/en/scenarios/generate-scenario-scenes-prompt";
import { systemPrompt } from "@/prompts/ru/system/system-prompt";
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
          return;
        }

        await db
          .update(scenarioChapter)
          .set({ status: "generation" })
          .where(eq(scenarioChapter.id, scenarioChapterId));

        const { scenarioChaptersTimeline, alreadyGeneratedScenesByChapter } =
          buildScenesGenerationContext(
            foundScenarioChapter.scenarioVersion.chapters,
            foundScenarioChapter.id,
          );

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
            scenarioChaptersTimeline,
            alreadyGeneratedScenesByChapter,
          },
        });

        const {
          output: { scenes: generatedScenarioScenes },
          usage,
        } = await generateText({
          model: polza.languageModel(envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL),
          output: Output.object({
            schema: z.object({
              scenes: z.array(scenarioSceneGeneratedSchema),
            }),
          }),
          system: systemPrompt(),
          prompt,
          onFinish: (data) => {
            console.log("Scenario scenes generation finished", data.response);
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

type ChapterWithScenes = {
  id: string;
  name: string;
  description: string | null;
  startTime: number;
  endTime: number;
  scenes: {
    id: string;
    name: string;
    description: string | null;
    startTime: number;
    endTime: number;
  }[];
};

function buildScenesGenerationContext(
  chapters: ChapterWithScenes[],
  currentChapterId: string,
) {
  const scenarioChaptersTimeline = chapters
    .map((chapter) => ({
      id: chapter.id,
      name: chapter.name,
      description: chapter.description,
      startTime: chapter.startTime,
      endTime: chapter.endTime,
    }))
    .sort((a, b) => a.startTime - b.startTime);

  const alreadyGeneratedScenesByChapter = chapters
    .filter((chapter) => chapter.id !== currentChapterId)
    .map((chapter) => ({
      chapterId: chapter.id,
      chapterName: chapter.name,
      scenes: chapter.scenes
        .map((scene) => ({
          id: scene.id,
          name: scene.name,
          description: scene.description,
          startTime: scene.startTime,
          endTime: scene.endTime,
        }))
        .sort((a, b) => a.startTime - b.startTime),
    }))
    .filter((chapter) => chapter.scenes.length > 0);

  return {
    scenarioChaptersTimeline,
    alreadyGeneratedScenesByChapter,
  };
}
