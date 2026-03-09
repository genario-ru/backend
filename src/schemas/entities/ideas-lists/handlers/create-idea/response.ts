import { z } from "@/lib/zod";
import { ideaSchema } from "@/schemas/entities/ideas/entities/idea";

export const createIdeaResponseSchema = z
  .object({
    data: ideaSchema,
  })
  .meta({
    title: "Create idea response",
    description: "Create idea response description",
    ref: "CreateIdeaResponseSchema",
  });

export type CreateIdeaResponse = z.infer<typeof createIdeaResponseSchema>;
