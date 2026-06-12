import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { zodTextFormat } from "openai/helpers/zod";

import { generateScenarioChaptersPrompt } from "@/ai/prompts/builders/generate-scenario-chapters";
import { systemPrompt } from "@/ai/prompts/builders/system-prompt";
import { polzaAI } from "@/ai/providers/open-ai/polza-ai";
import { db } from "@/db";
import { generationLog, scenarioChapter, scenarioVersion } from "@/db/schema";
import { creditsPricing } from "@/domains/credits/constants/credits-pricing";
import { chargeCredits } from "@/domains/credits/services/charge-credits";
import { getCreditsBalance } from "@/domains/credits/services/get-credits-balance";
import { scenarioChapterGeneratedSchema } from "@/domains/scenarios/schemas/entities/scenario-chapter";
import { env } from "@/env";
import { redis } from "@/lib/redis";
import { z } from "@/lib/zod";
import { getSafeJobLogContext } from "@/shared/utils/mq/get-safe-job-log-context";
import { isFinalJobFailure } from "@/shared/utils/mq/is-final-job-failure";

import { enqueueScenarioChapterScenesGeneration } from "../scenario-chapter-scenes-generation/queue";
import {
  SCENARIO_CHAPTERS_GENERATION_QUEUE_NAME,
  type ScenarioChaptersGenerationJobData,
} from "./queue";

export const scenarioChaptersGenerationWorker =
  new Worker<ScenarioChaptersGenerationJobData>(
    SCENARIO_CHAPTERS_GENERATION_QUEUE_NAME,
    async (job) => {
      const { scenarioId, scenarioVersionId } = job.data;

      console.log("Worker генерации глав сценария запущен", {
        scenarioId,
        scenarioVersionId,
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
        throw new Error(`Сценарий с id ${scenarioId} не найден`);
      }

      const creditsBalance = await getCreditsBalance({
        userId: foundScenario.userId,
      });

      if (creditsBalance < creditsPricing["scenario-chapters"]) {
        throw new Error("Недостаточно кредитов для выполнения операции");
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
          scenarioTemplateDetails: foundScenario.template?.details,
          scenarioProfileName: foundScenario.profile?.name,
          scenarioProfileDescription: foundScenario.profile?.description,
          scenarioPlatformNames: foundScenario.scenarioToPlatform.map(
            ({ platform }) => platform.name,
          ),
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

      const { output_parsed: generatedChaptersObject, usage } =
        await polzaAI.responses.parse({
          model: env.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
          temperature: 0.5,
          input: [
            { role: "system", content: systemPrompt() },
            {
              role: "user",
              content: prompt,
            },
          ],
          text: {
            format: zodTextFormat(
              z.object({ chapters: z.array(scenarioChapterGeneratedSchema) }),
              "scenarioChapters",
            ),
          },
          tools: [{ type: "web_search" }],
        });

      if (!generatedChaptersObject) {
        throw new Error("Не удалось сгенерировать разделы сценария");
      }

      console.log("Разделы сценария успешно сгенерированы");

      const generatedChapters = generatedChaptersObject.chapters;

      if (!generatedChapters.length) {
        throw new Error("Сгенерированный список разделов сценария пуст");
      }

      await db.transaction(async (tx) => {
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

        if (!createdScenarioChapters.length) {
          throw new Error("Не удалось сохранить разделы сценария");
        }

        await Promise.all([
          tx.insert(generationLog).values({
            entity: "scenario-chapters" as const,
            entityId: scenarioVersionId,
            model: env.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
            tokens: usage?.total_tokens ?? 0,
          }),
          chargeCredits({
            userId: foundScenario.userId,
            entity: "scenario-chapters",
            entityId: scenarioVersionId,
            totalTokens: usage?.total_tokens ?? 0,
            tx,
          }),
        ]);

        await tx
          .update(scenarioVersion)
          .set({ status: "ready" })
          .where(eq(scenarioVersion.id, scenarioVersionId));
      });

      await enqueueScenarioChapterScenesGeneration({ scenarioVersionId });
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

scenarioChaptersGenerationWorker.on("error", (error) => {
  console.error("Worker генерации глав сценария упал с ошибкой", error);
});

scenarioChaptersGenerationWorker.on("failed", async (job, error) => {
  console.error(
    "Worker генерации глав сценария упал с ошибкой",
    getSafeJobLogContext(job),
    error,
  );

  const isFinalFailure = await isFinalJobFailure(job);

  if (!job || !isFinalFailure) {
    return;
  }

  try {
    await db
      .update(scenarioVersion)
      .set({ status: "failed" })
      .where(eq(scenarioVersion.id, job.data.scenarioVersionId));
  } catch (updateError) {
    console.error("Не удалось обновить статус разделов сценария", updateError);
  }
});

scenarioChaptersGenerationWorker.on("completed", (job) => {
  console.log("Worker генерации глав сценария отработал успешно", job.id);
});
