import { z } from "@/lib/zod";

import { toneSchema } from "../../entities/tone";
export const getTonesResponseSchema = z
  .object({
    data: z.array(toneSchema),
  })
  .meta({
    title: "Get tones response",
    description: "Get tones response description",
    ref: "GetTonesResponseSchema",
  });

export type GetTonesResponse = z.infer<typeof getTonesResponseSchema>;
