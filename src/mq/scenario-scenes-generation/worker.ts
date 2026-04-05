import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { zodTextFormat } from "openai/helpers/zod";

import { generateScenarioScenesPrompt } from "@/ai/prompts/builders/generate-scenario-scenes";
import { systemPrompt } from "@/ai/prompts/builders/system-prompt";
import { polzaAI } from "@/ai/providers/open-ai/polza-ai";
import { envs } from "@/constants/shared/common/envs";
import { db } from "@/db";
import {
  generationLog,
  scenarioChapter,
  scenarioScene,
  scenarioSceneComponent,
} from "@/db/schema";
import { redis } from "@/lib/redis";
import { z } from "@/lib/zod";
import { scenarioSceneWithComponentsGeneratedSchema } from "@/schemas/domains/scenarios/entities/scenario-scene";

import {
  SCENARIO_SCENES_GENERATION_QUEUE_NAME,
  type ScenarioScenesGenerationJobData,
} from "./queue";

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
                chapters: {
                  with: { scenes: { with: { components: true } } },
                },
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

        const scenarioSceneComponentTypes =
          await db.query.scenarioSceneComponentType.findMany();

        if (!scenarioSceneComponentTypes.length) {
          console.warn(`Scenario scene component types not found`);

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
            chapterStartTime: foundScenarioChapter.startTime ?? 0,
            chapterEndTime: foundScenarioChapter.endTime ?? 0,
            availableSceneComponentTypes: scenarioSceneComponentTypes,
            previousGeneratedChapters:
              foundScenarioChapter.scenarioVersion.chapters,
          },
        });

        const { output_parsed: generatedScenesObject, usage } =
          await polzaAI.responses.parse({
            model: envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
            temperature: 0.7,
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
                  scenes: z.array(scenarioSceneWithComponentsGeneratedSchema),
                }),
                "scenarioScenes",
              ),
            },
          });

        if (!generatedScenesObject) {
          throw new Error("Scenario scenes generation failed");
        }

        console.log("Scenario scenes generation finished");

        const generatedScenes = generatedScenesObject.scenes;

        await db.transaction(async (tx) => {
          const createdScenes = await tx
            .insert(scenarioScene)
            .values(
              generatedScenes.map((scene) => ({
                scenarioChapterId,
                name: scene.name,
                startTime: scene.startTime,
                endTime: scene.endTime,
              })),
            )
            .returning();

          const componentsData = createdScenes.flatMap(
            (createdScene, index) => {
              const scene = generatedScenes[index];

              if (!scene.components?.length) return [];

              return scene.components.map((comp) => ({
                scenarioSceneId: createdScene.id,
                name: comp.name,
                content: comp.content ?? null,
                typeId: comp.typeId,
              }));
            },
          );

          if (componentsData.length > 0) {
            await tx.insert(scenarioSceneComponent).values(componentsData);
          }

          if (generatedScenes.length > 0) {
            await tx.insert(generationLog).values({
              entity: "scenario-chapter-scenes" as const,
              entityId: scenarioChapterId,
              prompt,
              model: envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
              tokens: usage?.total_tokens ?? 0,
            });
          }

          await tx
            .update(scenarioChapter)
            .set({ status: "ready" })
            .where(eq(scenarioChapter.id, scenarioChapterId));
        });
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
