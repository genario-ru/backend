import { generateText, Output } from "ai";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { aiGenerationLog, idea, ideasList } from "@/db/schema";
import { polza } from "@/lib/ai/providers/polza";

import { redis } from "../../lib/redis";
import {
  IDEA_GENERATION_QUEUE_NAME,
  type IdeaGenerationJobData,
} from "../queues/idea-generation.queue";

const ideaItemSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
});

const buildPrompt = ({
  name,
  description,
  targetAudience,
  templateName,
  templateDescription,
  profileName,
  profileDescription,
  tones,
  videoTypes,
  count,
}: {
  name?: string | null;
  description?: string | null;
  targetAudience?: string | null;
  templateName?: string | null;
  templateDescription?: string | null;
  profileName?: string | null;
  profileDescription?: string | null;
  tones: string[];
  videoTypes: string[];
  count: number;
}) => {
  const contextLines = [
    "Generate a list of short, practical content ideas in JSON format.",
    `Count: ${count}.`,
    name ? `Ideas list name: ${name}.` : null,
    description ? `Ideas list description: ${description}.` : null,
    targetAudience ? `Target audience: ${targetAudience}.` : null,
    profileName ? `Profile: ${profileName}.` : null,
    profileDescription ? `Profile description: ${profileDescription}.` : null,
    templateName ? `Template: ${templateName}.` : null,
    templateDescription
      ? `Template description: ${templateDescription}.`
      : null,
    tones.length > 0 ? `Tones: ${tones.join(", ")}.` : null,
    videoTypes.length > 0 ? `Video types: ${videoTypes.join(", ")}.` : null,
    "Return concise titles and short descriptions. Return valid JSON only.",
  ].filter(Boolean);

  return contextLines.join("\n");
};

export const ideaGenerationWorker = new Worker<IdeaGenerationJobData>(
  IDEA_GENERATION_QUEUE_NAME,
  async (job) => {
    console.log("Idea generation worker");

    const { ideasListId, count } = job.data;
    const safeCount = Math.min(count, 20);

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

    console.log("Idea generation worker foundIdeasList", foundIdeasList);

    if (!foundIdeasList) {
      return;
    }

    const videoTypeIds = foundIdeasList.ideasListToVideoType.map(
      ({ videoTypeId }) => videoTypeId,
    );

    await db
      .update(ideasList)
      .set({ status: "generation" })
      .where(eq(ideasList.id, ideasListId));

    console.log(
      "Idea generation worker update ideas list status to generation",
    );

    const modelId = "openai/gpt-4.1-mini";
    const prompt = buildPrompt({
      name: foundIdeasList.name,
      description: foundIdeasList.description,
      targetAudience: foundIdeasList.targetAudience,
      templateName: foundIdeasList.template?.name,
      templateDescription: foundIdeasList.template?.description,
      profileName: foundIdeasList.profile?.name,
      profileDescription: foundIdeasList.profile?.description,
      tones: foundIdeasList.ideasListToTone.map(({ tone }) => tone.name),
      videoTypes: foundIdeasList.ideasListToVideoType.map(
        ({ videoType }) => videoType.name,
      ),
      count: safeCount,
    });

    console.log("Idea generation worker prompt", prompt);

    const ideasSchema = z.object({
      ideas: z.array(ideaItemSchema).min(safeCount).max(safeCount),
    });

    try {
      const { output, usage } = await generateText({
        model: polza(modelId),
        output: Output.object({
          schema: ideasSchema,
        }),
        prompt,
      });

      const generatedIdeas = output.ideas.slice(0, safeCount);
      const totalTokens = usage?.totalTokens ?? 0;

      console.log("Idea generation worker generatedIdeas", generatedIdeas);
      console.log("Idea generation worker totalTokens", totalTokens);

      await db.transaction(async (tx) => {
        const createdIdeas = await tx
          .insert(idea)
          .values(
            generatedIdeas.map((generatedIdea, index) => ({
              ideasListId,
              videoTypeId: videoTypeIds[index % videoTypeIds.length],
              name: generatedIdea.name ?? generatedIdea.title ?? "Idea",
              description: generatedIdea.description ?? null,
            })),
          )
          .returning();

        console.log("Idea generation worker created ideas", createdIdeas);

        if (createdIdeas.length > 0) {
          const entityType = "idea" as const;

          await tx.insert(aiGenerationLog).values({
            entityType,
            entityId: foundIdeasList.id,
            prompt,
            model: modelId,
            tokens: totalTokens,
          });
        }

        console.log("Idea generation worker update ideas list status to ready");

        await tx
          .update(ideasList)
          .set({ status: "ready" })
          .where(eq(ideasList.id, ideasListId));
      });
    } catch (error) {
      console.log("Idea generation worker error", error);

      await db
        .update(ideasList)
        .set({ status: "failed" })
        .where(eq(ideasList.id, ideasListId));

      throw error;
    }
  },
  {
    connection: redis,
  },
);
