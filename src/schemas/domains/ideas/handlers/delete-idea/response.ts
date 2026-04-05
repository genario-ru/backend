import { z } from "@/lib/zod";

import { ideaSchema } from "../../entities/idea";
export const deleteIdeaResponseSchema = z
  .object({
    data: ideaSchema,
  })
  .meta({
    title: "Delete idea response",
    description: "Delete idea response description",
    ref: "DeleteIdeaResponseSchema",
  });

export type DeleteIdeaResponse = z.infer<typeof deleteIdeaResponseSchema>;
