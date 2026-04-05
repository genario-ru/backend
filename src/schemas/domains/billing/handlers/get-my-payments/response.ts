import { z } from "@/lib/zod";

import { paymentExtendedSchema } from "../../entities/payment";

export const getMyPaymentsResponseSchema = z
  .object({
    data: z.array(paymentExtendedSchema),
  })
  .meta({
    title: "Get my payments response",
    description: "Get my payments response description",
    ref: "GetMyPaymentsResponseSchema",
  });

export type GetMyPaymentsResponse = z.infer<typeof getMyPaymentsResponseSchema>;
