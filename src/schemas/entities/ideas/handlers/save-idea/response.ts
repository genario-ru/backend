import { z } from "@/lib/zod";

import { ideaSchema } from "../../entities/idea";
export const saveIdeaResponseSchema = z
  .object({
    data: ideaSchema,
  })
  .meta({
    title: "Save idea response",
    description: "Save idea response description",
    ref: "SaveIdeaResponseSchema",
  });

export type SaveIdeaResponse = z.infer<typeof saveIdeaResponseSchema>;
