import { ideaSchema } from "@/domains/ideas/schemas/entities/idea";
import { z } from "@/lib/zod";

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
