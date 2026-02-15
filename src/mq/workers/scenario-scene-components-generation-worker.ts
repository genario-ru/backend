import { generateText, Output } from "ai";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import * as z from "zod";

import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import {
  aiGenerationLog,
  scenarioScene,
  scenarioSceneComponent,
} from "@/db/schema";
import { polza } from "@/lib/ai/providers/polza";
import { redis } from "@/lib/redis";
import { generateScenarioSceneComponentsPrompt } from "@/prompts/scenarios/generate-scenario-scene-components-prompt";
import { systemPrompt } from "@/prompts/system/system-prompt";
import { scenarioSceneComponentGeneratedSchema } from "@/schemas/entities/scenarios/entities/scenario-scene-component";

import {
  SCENARIO_SCENE_COMPONENTS_GENERATION_QUEUE_NAME,
  type ScenarioSceneComponentsGenerationJobData,
} from "../queues/scenario-scene-components-generation-queue";

export const scenarioSceneComponentsGenerationWorker =
  new Worker<ScenarioSceneComponentsGenerationJobData>(
    SCENARIO_SCENE_COMPONENTS_GENERATION_QUEUE_NAME,
    async (job) => {
      const { scenarioSceneId } = job.data;

      console.log(
        "Scenario scene components generation worker started",
        job.data,
      );

      try {
        const foundScenarioScene = await db.query.scenarioScene.findFirst({
          where: (scenarioScene, { eq }) =>
            eq(scenarioScene.id, scenarioSceneId),
          with: {
            scenarioChapter: {
              with: {
                scenarioVersion: {
                  with: {
                    scenario: true,
                  },
                },
              },
            },
          },
        });

        if (!foundScenarioScene) {
          console.warn(`Scenario scene not found: ${scenarioSceneId}`);

          return;
        }

        await db
          .update(scenarioScene)
          .set({ status: "generation" })
          .where(eq(scenarioScene.id, scenarioSceneId));

        const scenarioSceneComponentTypes =
          await db.query.scenarioSceneComponentType.findMany();

        if (!scenarioSceneComponentTypes.length) {
          console.warn(`Scenario scene component types not found`);

          return;
        }

        const availableSceneComponentTypes = scenarioSceneComponentTypes.map(
          ({ id, name, description, optional }) => ({
            id,
            name,
            description,
            optional,
          }),
        );

        const { scenarioChapter: foundScenarioChapter } = foundScenarioScene;

        const prompt = generateScenarioSceneComponentsPrompt({
          context: {
            scenarioName:
              foundScenarioChapter.scenarioVersion.scenario.name ?? "",
            scenarioDescription:
              foundScenarioChapter.scenarioVersion.scenario.description ?? "",
            scenarioTargetAudience:
              foundScenarioChapter.scenarioVersion.scenario.targetAudience ??
              "",
            chapterName: foundScenarioChapter.name ?? "",
            chapterDescription: foundScenarioChapter.description ?? "",
            chapterStartTime: foundScenarioChapter.startTime ?? 0,
            chapterEndTime: foundScenarioChapter.endTime ?? 0,
            sceneName: foundScenarioScene.name ?? "",
            sceneDescription: foundScenarioScene.description ?? "",
            sceneStartTime: foundScenarioScene.startTime ?? 0,
            sceneEndTime: foundScenarioScene.endTime ?? 0,
            availableSceneComponentTypes,
          },
        });

        const {
          output: { components: generatedScenarioSceneComponents },
          usage,
        } = await generateText({
          model: polza.languageModel(envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL),
          output: Output.object({
            schema: z.object({
              components: z.array(scenarioSceneComponentGeneratedSchema),
            }),
          }),
          system: systemPrompt(),
          prompt,
          onFinish: (data) => {
            console.log(
              "Scenario scene components generation finished",
              data.response,
            );
          },
        });

        await db.transaction(async (tx) => {
          const createdScenarioSceneComponents = await tx
            .insert(scenarioSceneComponent)
            .values(
              generatedScenarioSceneComponents.map((component) => ({
                scenarioSceneId,
                name: component.name,
                content: component.content,
                typeId: component.typeId,
              })),
            )
            .returning();

          if (createdScenarioSceneComponents.length > 0) {
            await tx.insert(aiGenerationLog).values(
              createdScenarioSceneComponents.map((component) => ({
                entityType: "scenario-scene-component" as const,
                entityId: component.id,
                prompt,
                model: envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
                tokens: usage?.totalTokens ?? 0,
              })),
            );
          } else {
            console.warn(`No scenario scene components generated`);
          }

          await tx
            .update(scenarioScene)
            .set({ status: "ready" })
            .where(eq(scenarioScene.id, scenarioSceneId));
        });
      } catch (error) {
        try {
          await db
            .update(scenarioScene)
            .set({ status: "failed" })
            .where(eq(scenarioScene.id, scenarioSceneId));
        } catch (updateError) {
          console.error(
            "Scenario scene components generation worker failed to update status",
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

scenarioSceneComponentsGenerationWorker.on("error", (error) => {
  console.error("Scenario scene components generation worker error", error);
});

scenarioSceneComponentsGenerationWorker.on("failed", (job, error) => {
  console.error(
    "Scenario scene components generation worker failed",
    job?.toJSON(),
    error,
  );
});

scenarioSceneComponentsGenerationWorker.on("completed", (job) => {
  console.log("Scenario scene components generation worker completed", job.id);
});
