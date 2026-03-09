import { z } from "@/lib/zod";

import { toneSchema } from "../../entities/tone";
import { tonesRegistry } from "../../registry";

export const getTonesResponseSchema = z
  .object({
    data: z.array(toneSchema),
  })
  .register(tonesRegistry, {
    title: "Get tones response",
    description: "Get tones response description",
    ref: "GetTonesResponseSchema",
  });

export type GetTonesResponse = z.infer<typeof getTonesResponseSchema>;
