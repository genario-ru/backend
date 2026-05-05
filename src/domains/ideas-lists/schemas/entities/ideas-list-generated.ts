import { ideaGeneratedSchema } from "@/domains/ideas/schemas/entities/idea";
import { z } from "@/lib/zod";

export const ideasListGeneratedSchema = z
  .object({
    name: z.string().min(3).max(80),
    description: z.string().min(16).max(500),
    ideas: z.array(ideaGeneratedSchema),
  })
  .meta({
    title: "Ideas list generated",
    description: "Ideas list generated description",
    ref: "IdeasListGeneratedSchema",
  });

export type IdeasListGenerated = z.infer<typeof ideasListGeneratedSchema>;
