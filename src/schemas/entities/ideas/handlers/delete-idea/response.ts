import { z } from "zod";

import { ideaSchema } from "../../entities/idea";

export const deleteIdeaResponseSchema = z.object({
  data: ideaSchema,
});

export type DeleteIdeaResponse = z.infer<typeof deleteIdeaResponseSchema>;
