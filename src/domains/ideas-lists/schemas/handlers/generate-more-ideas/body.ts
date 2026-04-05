import { z } from "@/lib/zod";

export const generateMoreIdeasBodySchema = z
  .object({
    userPrompt: z.string().nullish(),
  })
  .meta({
    title: "Generate more ideas body",
    description: "Generate more ideas body description",
    ref: "GenerateMoreIdeasBodySchema",
  });

export type GenerateMoreIdeasBody = z.infer<typeof generateMoreIdeasBodySchema>;
