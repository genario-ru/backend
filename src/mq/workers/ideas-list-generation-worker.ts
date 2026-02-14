import { generateText, Output } from "ai";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import * as z from "zod";

import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import { aiGenerationLog, idea, ideasList } from "@/db/schema";
import { polza } from "@/lib/ai/providers/polza";
import { redis } from "@/lib/redis";
import { generateIdeasListPrompt } from "@/prompts/ideas-lists/generate-ideas-list-prompt";
import { systemPrompt } from "@/prompts/system/system-prompt";
import { ideaGeneratedSchema } from "@/schemas/entities/ideas/entities/idea";

import {
  IDEAS_LIST_GENERATION_QUEUE_NAME,
  type IdeasListGenerationJobData,
} from "../queues/ideas-list-generation-queue";

export const ideasListGenerationWorker = new Worker<IdeasListGenerationJobData>(
  IDEAS_LIST_GENERATION_QUEUE_NAME,
  async (job) => {
    const { ideasListId, userPrompt, count } = job.data;
    const safeCount = Math.min(count, 20);

    try {
      const foundIdeasList = await db.query.ideasList.findFirst({
        where: (ideasList, { eq }) => eq(ideasList.id, ideasListId),
        with: {
          profile: true,
          template: true,
          ideasListToTone: {
            with: { tone: true },
          },
          ideasListToVideoType: {
            with: { videoType: true },
          },
        },
      });

      if (!foundIdeasList) {
        return;
      }

      await db
        .update(ideasList)
        .set({ status: "generation" })
        .where(eq(ideasList.id, ideasListId));

      const prompt = generateIdeasListPrompt({
        userPrompt,
        settings: {
          ideasCount: safeCount,
        },
        context: {
          name: foundIdeasList.name,
          description: foundIdeasList.description,
          targetAudience: foundIdeasList.targetAudience,
          templateName: foundIdeasList.template?.name,
          templateDescription: foundIdeasList.template?.description,
          profileName: foundIdeasList.profile?.name,
          profileDescription: foundIdeasList.profile?.description,
          tones: foundIdeasList.ideasListToTone.map(({ tone }) => tone.name),
          videoTypes: foundIdeasList.ideasListToVideoType.map(
            ({ videoType }) => ({
              id: videoType.id,
              name: videoType.name,
            }),
          ),
        },
      });

      const {
        output: { ideas: generatedIdeasRaw },
        usage,
      } = await generateText({
        model: polza.languageModel(envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL),
        output: Output.object({
          schema: z.object({
            ideas: z.array(ideaGeneratedSchema),
          }),
        }),
        system: systemPrompt(),
        prompt,
      });

      console.log("Ideas list generation output", generatedIdeasRaw);

      const generatedIdeas = generatedIdeasRaw.slice(0, safeCount);
      const totalTokens = usage?.totalTokens ?? 0;

      await db.transaction(async (tx) => {
        const createdIdeas = await tx
          .insert(idea)
          .values(
            generatedIdeas.map((generatedIdea) => ({
              ideasListId,
              videoTypeId: generatedIdea.videoTypeId,
              name: generatedIdea.name ?? "Идея",
              description: generatedIdea.description ?? null,
            })),
          )
          .returning();

        if (createdIdeas.length > 0) {
          const entityType = "idea" as const;

          await tx.insert(aiGenerationLog).values({
            entityType,
            entityId: foundIdeasList.id,
            prompt,
            model: envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
            tokens: totalTokens,
          });
        }

        await tx
          .update(ideasList)
          .set({ status: "ready" })
          .where(eq(ideasList.id, ideasListId));
      });
    } catch (error) {
      console.error("Ideas generation worker error", error);

      try {
        await db
          .update(ideasList)
          .set({ status: "failed" })
          .where(eq(ideasList.id, ideasListId));
      } catch (updateError) {
        console.error(
          "Ideas generation worker failed to update status",
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

ideasListGenerationWorker.on("error", (error) => {
  console.error("Ideas list generation worker error", error);
});

ideasListGenerationWorker.on("completed", (job) => {
  console.log("Ideas list generation worker completed", job.id);
});
