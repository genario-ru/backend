import { z } from "@/lib/zod";

import { ideaSchema } from "../../entities/idea";
import { ideasRegistry } from "../../registry";

export const saveIdeaResponseSchema = z
  .object({
    data: ideaSchema,
  })
  .register(ideasRegistry, {
    title: "Save idea response",
    description: "Save idea response description",
    ref: "SaveIdeaResponseSchema",
  });

export type SaveIdeaResponse = z.infer<typeof saveIdeaResponseSchema>;
