import { z } from "zod";

import { ideaSchema } from "../../entities/idea";
import { ideasRegistry } from "../../registry";

export const deleteIdeaResponseSchema = z
  .object({
    data: ideaSchema,
  })
  .register(ideasRegistry, {
    title: "Delete idea response",
    description: "Delete idea response description",
    ref: "DeleteIdeaResponseSchema",
  });

export type DeleteIdeaResponse = z.infer<typeof deleteIdeaResponseSchema>;
