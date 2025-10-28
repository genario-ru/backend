import * as z from "zod";

import { ideaExtendedSchema } from "@/schemas/entities/ideas/entities/idea";

export const getIdeasResponseSchema = z.object({
  data: z.array(ideaExtendedSchema),
});

export type GetIdeasResponse = z.infer<typeof getIdeasResponseSchema>;
