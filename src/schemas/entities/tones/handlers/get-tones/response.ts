import * as z from "zod";

import { toneSchema } from "../../entities/tone";

export const getTonesResponseSchema = z.object({
  data: z.array(toneSchema),
});

export type GetTonesResponse = z.infer<typeof getTonesResponseSchema>;
