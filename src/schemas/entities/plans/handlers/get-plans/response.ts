import * as z from "zod";

import { planSchema } from "../../entities/plan";
import { plansRegistry } from "../../registry";

export const getPlansResponseSchema = z
  .object({
    data: z.array(planSchema),
  })
  .register(plansRegistry, {
    title: "Get plans response",
    description: "Get plans response description",
    ref: "GetPlansResponseSchema",
  });

export type GetPlansResponse = z.infer<typeof getPlansResponseSchema>;
