import { generateText, Output } from "ai";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import { generationLog, idea, ideasList } from "@/db/schema";
import { polzaAI } from "@/lib/ai/providers/polza-ai";
import { redis } from "@/lib/redis";
import { z } from "@/lib/zod";
import { generateIdeasListPrompt } from "@/prompts/ideas-lists/generate-ideas-list-prompt";
import { systemPrompt } from "@/prompts/system/system-prompt";
import { ideaGeneratedSchema } from "@/schemas/entities/ideas/entities/idea";

import {
  IDEAS_LIST_GENERATION_QUEUE_NAME,
  type IdeasListGenerationJobData,
} from "../queues/ideas-list-generation-queue";

const IDEAS_PER_LIST_COUNT = 4;

export const ideasListGenerationWorker = new Worker<IdeasListGenerationJobData>(
  IDEAS_LIST_GENERATION_QUEUE_NAME,
  async (job) => {
    const { ideasListId, userPrompt } = job.data;

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
        console.warn(`Ideas list with id ${ideasListId} was not found`);

        return;
      }

      await db
        .update(ideasList)
        .set({ status: "generation" })
        .where(eq(ideasList.id, ideasListId));

      const prompt = generateIdeasListPrompt({
        userPrompt,
        ideasCount: IDEAS_PER_LIST_COUNT,
        ideasListName: foundIdeasList.name,
        ideasListDescription: foundIdeasList.description,
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

      const {
        output: { ideas: generatedIdeas },
        usage,
      } = await generateText({
        model: polzaAI.languageModel(envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL),
        output: Output.object({
          schema: z.object({
            ideas: z.array(ideaGeneratedSchema),
          }),
        }),
        temperature: 0.2,
        system: systemPrompt(),
        prompt,
        onFinish: (data) => {
          console.log("Ideas list generation finished", data.response.id);
        },
      });

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
          await tx.insert(generationLog).values({
            entity: "ideas-list" as const,
            entityId: foundIdeasList.id,
            prompt,
            model: envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
            tokens: usage?.totalTokens ?? 0,
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
    concurrency: 5,
    connection: redis,
  },
);

ideasListGenerationWorker.on("error", (error) => {
  console.error("Ideas list generation worker error", error);
});

ideasListGenerationWorker.on("failed", (job, error) => {
  console.error("Ideas list generation worker failed", job?.toJSON(), error);
});

ideasListGenerationWorker.on("completed", (job) => {
  console.log("Ideas list generation worker completed", job.id);
});
