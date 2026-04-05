import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { zodTextFormat } from "openai/helpers/zod";

import { generateIdeasListPrompt } from "@/ai/prompts/builders/generate-ideas-list";
import { systemPrompt } from "@/ai/prompts/builders/system-prompt";
import { polzaAI } from "@/ai/providers/open-ai/polza-ai";
import { envs } from "@/constants/shared/common/envs";
import { db } from "@/db";
import { generationLog, idea, ideasList } from "@/db/schema";
import { redis } from "@/lib/redis";
import { z } from "@/lib/zod";
import { ideaGeneratedSchema } from "@/schemas/domains/ideas/entities/idea";

import {
  IDEAS_LIST_GENERATION_QUEUE_NAME,
  type IdeasListGenerationJobData,
} from "./queue";

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

      const { output_parsed: generatedIdeasObject, usage } =
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
              z.object({ ideas: z.array(ideaGeneratedSchema) }),
              "ideasList",
            ),
          },
        });

      if (!generatedIdeasObject) {
        throw new Error("Ideas list generation failed");
      }

      console.log("Ideas list generation finished");

      const generatedIdeas = generatedIdeasObject.ideas;

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
            tokens: usage?.total_tokens ?? 0,
          });
        }

        await tx
          .update(ideasList)
          .set({ status: "ready" })
          .where(eq(ideasList.id, ideasListId));
      });
    } catch (error) {
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
