import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { zodTextFormat } from "openai/helpers/zod";

import { generateScenarioScenesPrompt } from "@/ai/prompts/builders/generate-scenario-scenes";
import { systemPrompt } from "@/ai/prompts/builders/system-prompt";
import { polzaAI } from "@/ai/providers/open-ai/polza-ai";
import { db } from "@/db";
import {
  generationLog,
  scenarioChapter,
  scenarioScene,
  scenarioSceneComponent,
} from "@/db/schema";
import { creditsPricing } from "@/domains/credits/constants/credits-pricing";
import { chargeCredits } from "@/domains/credits/services/charge-credits";
import { getCreditsBalance } from "@/domains/credits/services/get-credits-balance";
import { scenarioSceneWithComponentsGeneratedSchema } from "@/domains/scenarios/schemas/entities/scenario-scene";
import { env } from "@/env";
import { redis } from "@/lib/redis";
import { z } from "@/lib/zod";
import { getSafeJobLogContext } from "@/shared/utils/mq/get-safe-job-log-context";
import { isFinalJobFailure } from "@/shared/utils/mq/is-final-job-failure";

import {
  SCENARIO_SCENES_GENERATION_QUEUE_NAME,
  type ScenarioScenesGenerationJobData,
} from "./queue";

export const scenarioScenesGenerationWorker =
  new Worker<ScenarioScenesGenerationJobData>(
    SCENARIO_SCENES_GENERATION_QUEUE_NAME,
    async (job) => {
      const { scenarioChapterId } = job.data;

      console.log("Worker генерации сцен сценария запущен", {
        scenarioChapterId,
        jobId: job.id,
      });

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
        throw new Error(`Раздел сценария с id ${scenarioChapterId} не найден`);
      }

      const scenarioSceneComponentTypes =
        await db.query.scenarioSceneComponentType.findMany();

      if (!scenarioSceneComponentTypes.length) {
        throw new Error("Типы компонентов сцены сценария не найдены");
      }

      const creditsBalance = await getCreditsBalance({
        userId: foundScenarioChapter.scenarioVersion.scenario.userId,
      });

      if (creditsBalance < creditsPricing["scenario-chapter-scenes"]) {
        throw new Error("Недостаточно кредитов для выполнения операции");
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
          model: env.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
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
          tools: [{ type: "web_search" }],
        });

      if (!generatedScenesObject) {
        throw new Error("Не удалось сгенерировать сцены сценария");
      }

      console.log("Сцены сценария успешно сгенерированы");

      const generatedScenes = generatedScenesObject.scenes;

      if (!generatedScenes.length) {
        throw new Error("Сгенерированный список сцен сценария пуст");
      }

      const validComponentTypeIds = new Set(
        scenarioSceneComponentTypes.map((type) => type.id),
      );

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

        const componentsData = createdScenes.flatMap((createdScene, index) => {
          const scene = generatedScenes[index];

          if (!scene.components?.length) return [];

          return scene.components
            .filter((comp) => {
              const isKnownType = validComponentTypeIds.has(comp.typeId);

              if (!isKnownType) {
                console.warn(
                  "Пропущен компонент сцены с неизвестным typeId (галлюцинация ИИ)",
                  {
                    scenarioChapterId,
                    sceneName: scene.name,
                    componentName: comp.name,
                    typeId: comp.typeId,
                  },
                );
              }

              return isKnownType;
            })
            .map((comp) => ({
              scenarioSceneId: createdScene.id,
              name: comp.name,
              content: comp.content,
              typeId: comp.typeId,
            }));
        });

        if (componentsData.length > 0) {
          await tx.insert(scenarioSceneComponent).values(componentsData);
        }

        await Promise.all([
          tx.insert(generationLog).values({
            entity: "scenario-chapter-scenes" as const,
            entityId: scenarioChapterId,
            model: env.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
            tokens: usage?.total_tokens ?? 0,
          }),
          chargeCredits({
            userId: foundScenarioChapter.scenarioVersion.scenario.userId,
            entity: "scenario-chapter-scenes",
            entityId: scenarioChapterId,
            totalTokens: usage?.total_tokens ?? 0,
            tx,
          }),
        ]);

        await tx
          .update(scenarioChapter)
          .set({ status: "ready" })
          .where(eq(scenarioChapter.id, scenarioChapterId));
      });
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

scenarioScenesGenerationWorker.on("error", (error) => {
  console.error("Scenario scenes generation worker error", error);
});

scenarioScenesGenerationWorker.on("failed", async (job, error) => {
  console.error(
    "Scenario scenes generation worker failed",
    getSafeJobLogContext(job),
    error,
  );

  const isFinalFailure = await isFinalJobFailure(job);

  if (!job || !isFinalFailure) {
    return;
  }

  try {
    await db
      .update(scenarioChapter)
      .set({ status: "failed" })
      .where(eq(scenarioChapter.id, job.data.scenarioChapterId));
  } catch (updateError) {
    console.error("Не удалось обновить статус сцен сценария", updateError);
  }
});

scenarioScenesGenerationWorker.on("completed", (job) => {
  console.log("Scenario scenes generation worker completed", job.id);
});
