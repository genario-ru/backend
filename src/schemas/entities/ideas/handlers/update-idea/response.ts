import * as z from "zod";

import { ideaSchema } from "../../entities/idea";
import { ideasRegistry } from "../../registry";

export const updateIdeaResponseSchema = z
  .object({
    data: ideaSchema,
  })
  .register(ideasRegistry, {
    title: "Update idea response",
    description: "Update idea response description",
    ref: "UpdateIdeaResponseSchema",
  });

export type UpdateIdeaResponse = z.infer<typeof updateIdeaResponseSchema>;
