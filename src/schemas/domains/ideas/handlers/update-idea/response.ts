import { z } from "@/lib/zod";

import { ideaSchema } from "../../entities/idea";
export const updateIdeaResponseSchema = z
  .object({
    data: ideaSchema,
  })
  .meta({
    title: "Update idea response",
    description: "Update idea response description",
    ref: "UpdateIdeaResponseSchema",
  });

export type UpdateIdeaResponse = z.infer<typeof updateIdeaResponseSchema>;
