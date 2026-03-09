import { z } from "@/lib/zod";

import { ideaExtendedSchema } from "../../entities/idea";
export const getIdeaResponseSchema = z
  .object({
    data: ideaExtendedSchema,
  })
  .meta({
    title: "Get idea response",
    description: "Get idea response description",
    ref: "GetIdeaResponseSchema",
  });

export type GetIdeaResponse = z.infer<typeof getIdeaResponseSchema>;
