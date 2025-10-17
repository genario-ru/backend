import * as z from "zod";

import { ideaSchema } from "../../entities/idea";

export const updateIdeaResponseSchema = z.object({
  data: ideaSchema,
});

export type UpdateIdeaResponse = z.infer<typeof updateIdeaResponseSchema>;
