import { z } from "@/lib/zod";

import { alertSchema } from "../../entities/alert";

export const getAlertsResponseSchema = z
  .object({
    data: z.array(alertSchema),
  })
  .meta({
    title: "Get alerts response",
    description: "Get alerts response description",
    ref: "GetAlertsResponseSchema",
  });

export type GetAlertsResponse = z.infer<typeof getAlertsResponseSchema>;
