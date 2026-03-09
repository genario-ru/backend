import { z } from "@/lib/zod";

import { ideaExtendedSchema } from "../../entities/idea";
import { ideasRegistry } from "../../registry";

export const getIdeaResponseSchema = z
  .object({
    data: ideaExtendedSchema,
  })
  .register(ideasRegistry, {
    title: "Get idea response",
    description: "Get idea response description",
    ref: "GetIdeaResponseSchema",
  });

export type GetIdeaResponse = z.infer<typeof getIdeaResponseSchema>;
