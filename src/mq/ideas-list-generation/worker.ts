import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { zodTextFormat } from "openai/helpers/zod";

import { generateIdeasListPrompt } from "@/ai/prompts/builders/generate-ideas-list";
import { systemPrompt } from "@/ai/prompts/builders/system-prompt";
import { polzaAI } from "@/ai/providers/open-ai/polza-ai";
import { db } from "@/db";
import { generationLog, idea, ideasList } from "@/db/schema";
import { creditsPricing } from "@/domains/credits/constants/credits-pricing";
import { chargeCredits } from "@/domains/credits/services/charge-credits";
import { getCreditsBalance } from "@/domains/credits/services/get-credits-balance";
import { ideasListGeneratedSchema } from "@/domains/ideas-lists/schemas/entities/ideas-list-generated";
import { env } from "@/env";
import { redis } from "@/lib/redis";
import { getSafeJobLogContext } from "@/shared/utils/mq/get-safe-job-log-context";

import {
  IDEAS_LIST_GENERATION_QUEUE_NAME,
  type IdeasListGenerationJobData,
} from "./queue";

const IDEAS_PER_LIST_COUNT = 4;

export const ideasListGenerationWorker = new Worker<IdeasListGenerationJobData>(
  IDEAS_LIST_GENERATION_QUEUE_NAME,
  async (job) => {
    const { ideasListId, userPrompt } = job.data;

    console.log("Worker генерации списка идей запущен", {
      ideasListId,
      jobId: job.id,
    });

    try {
      const foundIdeasList = await db.query.ideasList.findFirst({
        where: (ideasList, { eq }) => eq(ideasList.id, ideasListId),
        with: {
          profile: true,
          template: true,
          ideas: {
            with: { videoType: true },
          },
          ideasListToTone: {
            with: { tone: true },
          },
          ideasListToVideoType: {
            with: { videoType: true },
          },
        },
      });

      if (!foundIdeasList) {
        console.warn(`Список идей с id ${ideasListId} не найден`);

        return;
      }

      const creditsBalance = await getCreditsBalance({
        userId: foundIdeasList.userId,
      });

      if (creditsBalance < creditsPricing["ideas-list"]) {
        throw new Error("Недостаточно кредитов для выполнения операции");
      }

      await db
        .update(ideasList)
        .set({ status: "generation" })
        .where(eq(ideasList.id, ideasListId));

      const prompt = generateIdeasListPrompt({
        userPrompt,
        ideasCount: IDEAS_PER_LIST_COUNT,
        ideasListPrompt: foundIdeasList.prompt,
        ideasListTargetAudience: foundIdeasList.targetAudience,
        ideasListTemplateName: foundIdeasList.template?.name,
        ideasListTemplateDescription: foundIdeasList.template?.description,
        ideasListProfileName: foundIdeasList.profile?.name,
        ideasListProfileDescription: foundIdeasList.profile?.description,
        ideasListTones: foundIdeasList.ideasListToTone.map(
          ({ tone }) => tone.name,
        ),
        ideasListVideoTypes: foundIdeasList.ideasListToVideoType.map(
          ({ videoType }) => ({
            id: videoType.id,
            name: videoType.name,
          }),
        ),
        previousGeneratedIdeas: foundIdeasList.ideas.map((idea) => ({
          name: idea.name,
          description: idea.description,
          videoType: {
            id: idea.videoTypeId,
            name: idea.videoType?.name,
          },
        })),
      });

      const { output_parsed: generatedObject, usage } =
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
            format: zodTextFormat(ideasListGeneratedSchema, "ideasList"),
          },
        });

      if (!generatedObject) {
        throw new Error("Не удалось сгенерировать список идей");
      }

      console.log("Список идей успешно сгенерирован");

      const generatedIdeas = generatedObject.ideas;

      await db.transaction(async (tx) => {
        const createdIdeas = await tx
          .insert(idea)
          .values(
            generatedIdeas.map((generatedIdea) => ({
              ideasListId,
              videoTypeId: generatedIdea.videoTypeId,
              name: generatedIdea.name,
              description: generatedIdea.description,
              reason: generatedIdea.reason,
            })),
          )
          .returning();

        if (createdIdeas.length > 0) {
          await Promise.all([
            tx.insert(generationLog).values({
              entity: "ideas-list",
              entityId: foundIdeasList.id,
              model: env.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
              tokens: usage?.total_tokens ?? 0,
            }),

            await chargeCredits({
              userId: foundIdeasList.userId,
              entity: "ideas-list",
              entityId: foundIdeasList.id,
              totalTokens: usage?.total_tokens ?? 0,
              transaction: tx,
            }),
          ]);
        } else {
          console.warn("Сгенерированный список идей пуст");
        }

        await tx
          .update(ideasList)
          .set({
            status: "ready",
            name: generatedObject.name,
            description: generatedObject.description,
          })
          .where(eq(ideasList.id, ideasListId));
      });
    } catch (error) {
      try {
        await db
          .update(ideasList)
          .set({ status: "failed" })
          .where(eq(ideasList.id, ideasListId));
      } catch (updateError) {
        console.error("Не удалось обновить статус списка идей", updateError);
      }

      throw error;
    }
  },
  {
    concurrency: 5,
    connection: redis,
  },
);

ideasListGenerationWorker.on("error", (error) => {
  console.error("Worker генерации списка идей отработал с ошибкой", error);
});

ideasListGenerationWorker.on("failed", (job, error) => {
  console.error(
    "Worker генерации списка идей упал с ошибкой",
    getSafeJobLogContext(job),
    error,
  );
});

ideasListGenerationWorker.on("completed", (job) => {
  console.log("Worker генерации списка идей отработал успешно", job.id);
});
