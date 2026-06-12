import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { zodTextFormat } from "openai/helpers/zod";

import { generateScenarioChapterScenesPrompt } from "@/ai/prompts/builders/generate-scenario-chapter-scenes";
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
  SCENARIO_CHAPTER_SCENES_GENERATION_QUEUE_NAME,
  type ScenarioChapterScenesGenerationJobData,
} from "./queue";

export const scenarioChapterScenesGenerationWorker =
  new Worker<ScenarioChapterScenesGenerationJobData>(
    SCENARIO_CHAPTER_SCENES_GENERATION_QUEUE_NAME,
    async (job) => {
      const { scenarioVersionId } = job.data;

      console.log("Worker генерации сцен всех разделов сценария запущен", {
        scenarioVersionId,
        jobId: job.id,
      });

      const foundScenarioVersion = await db.query.scenarioVersion.findFirst({
        where: (scenarioVersion, { eq }) =>
          eq(scenarioVersion.id, scenarioVersionId),
        with: {
          scenario: true,
          chapters: {
            orderBy: (scenarioChapter, { asc }) =>
              asc(scenarioChapter.startTime),
          },
        },
      });

      if (!foundScenarioVersion) {
        throw new Error(`Версия сценария с id ${scenarioVersionId} не найдена`);
      }

      const chapters = foundScenarioVersion.chapters;

      if (!chapters.length) {
        throw new Error(
          `У версии сценария с id ${scenarioVersionId} нет разделов`,
        );
      }

      const scenarioSceneComponentTypes =
        await db.query.scenarioSceneComponentType.findMany();

      if (!scenarioSceneComponentTypes.length) {
        throw new Error("Типы компонентов сцены сценария не найдены");
      }

      const creditsBalance = await getCreditsBalance({
        userId: foundScenarioVersion.scenario.userId,
      });

      if (
        creditsBalance <
        creditsPricing["scenario-chapter-scene"] * chapters.length
      ) {
        throw new Error("Недостаточно кредитов для выполнения операции");
      }

      await db
        .update(scenarioChapter)
        .set({ status: "generation" })
        .where(eq(scenarioChapter.scenarioVersionId, scenarioVersionId));

      const indexedChapters = chapters.map((chapter, index) => ({
        index: index + 1,
        chapter,
      }));

      const prompt = generateScenarioChapterScenesPrompt({
        context: {
          scenarioName: foundScenarioVersion.scenario.name,
          scenarioDescription: foundScenarioVersion.scenario.description,
          scenarioTargetAudience: foundScenarioVersion.scenario.targetAudience,
          chapters: indexedChapters.map(({ index, chapter }) => ({
            index,
            name: chapter.name,
            description: chapter.description,
            startTime: chapter.startTime ?? 0,
            endTime: chapter.endTime ?? 0,
          })),
          availableSceneComponentTypes: scenarioSceneComponentTypes,
        },
      });

      const { output_parsed: generatedChapterScenesObject, usage } =
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
                chapters: z.array(
                  z.object({
                    chapterIndex: z.number().int().min(1),
                    scenes: z.array(scenarioSceneWithComponentsGeneratedSchema),
                  }),
                ),
              }),
              "scenarioChapterScenes",
            ),
          },
          tools: [{ type: "web_search" }],
        });

      if (!generatedChapterScenesObject) {
        throw new Error("Не удалось сгенерировать сцены разделов сценария");
      }

      const generatedChapters = generatedChapterScenesObject.chapters;

      const chaptersByIndex = new Map(
        indexedChapters.map(({ index, chapter }) => [index, chapter]),
      );
      const generatedIndexes = new Set(
        generatedChapters.map(({ chapterIndex }) => chapterIndex),
      );

      const isEveryChapterGenerated =
        generatedIndexes.size === generatedChapters.length &&
        indexedChapters.every(({ index }) => generatedIndexes.has(index)) &&
        generatedChapters.every(({ chapterIndex }) =>
          chaptersByIndex.has(chapterIndex),
        );

      if (!isEveryChapterGenerated) {
        const expectedIndexes = indexedChapters
          .map(({ index }) => index)
          .join(", ");

        const receivedIndexes = [...generatedIndexes].join(", ");

        throw new Error(
          `Сгенерированные сцены не покрывают все разделы сценария (ожидались индексы: ${expectedIndexes}; получены: ${receivedIndexes})`,
        );
      }

      console.log("Сцены всех разделов сценария успешно сгенерированы");

      await db.transaction(async (tx) => {
        for (const { chapterIndex, scenes } of generatedChapters) {
          const chapter = chaptersByIndex.get(chapterIndex);

          if (!chapter || !scenes.length) {
            throw new Error(
              `Сгенерированный список сцен раздела сценария с индексом ${chapterIndex} пуст`,
            );
          }

          const createdScenes = await tx
            .insert(scenarioScene)
            .values(
              scenes.map((scene) => ({
                scenarioChapterId: chapter.id,
                name: scene.name,
                startTime: scene.startTime,
                endTime: scene.endTime,
              })),
            )
            .returning();

          const componentsData = createdScenes.flatMap(
            (createdScene, index) => {
              const scene = scenes[index];

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
        }

        await Promise.all([
          tx.insert(generationLog).values({
            entity: "scenario-chapter-scene" as const,
            entityId: scenarioVersionId,
            model: env.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
            tokens: usage?.total_tokens ?? 0,
          }),
          chargeCredits({
            userId: foundScenarioVersion.scenario.userId,
            entity: "scenario-chapter-scene",
            entityId: scenarioVersionId,
            totalTokens: usage?.total_tokens ?? 0,
            quantity: chapters.length,
            tx,
          }),
        ]);

        await tx
          .update(scenarioChapter)
          .set({ status: "ready" })
          .where(eq(scenarioChapter.scenarioVersionId, scenarioVersionId));
      });
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

scenarioChapterScenesGenerationWorker.on("error", (error) => {
  console.error("Scenario chapter scenes generation worker error", error);
});

scenarioChapterScenesGenerationWorker.on("failed", async (job, error) => {
  console.error(
    "Scenario chapter scenes generation worker failed",
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
      .where(eq(scenarioChapter.scenarioVersionId, job.data.scenarioVersionId));
  } catch (updateError) {
    console.error("Не удалось обновить статус сцен сценария", updateError);
  }
});

scenarioChapterScenesGenerationWorker.on("completed", (job) => {
  console.log("Scenario chapter scenes generation worker completed", job.id);
});
