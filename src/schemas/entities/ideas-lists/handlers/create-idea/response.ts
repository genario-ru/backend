import * as z from "zod";

import { ideaSchema } from "@/schemas/entities/ideas/entities/idea";

export const createIdeaResponseSchema = z.object({
  data: ideaSchema,
});

export type CreateIdeaResponse = z.infer<typeof createIdeaResponseSchema>;

