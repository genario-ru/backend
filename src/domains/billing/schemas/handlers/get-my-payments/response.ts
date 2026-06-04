import { z } from "@/lib/zod";

import { paymentPublicSchema } from "../../entities/payment";

export const getMyPaymentsResponseSchema = z
  .object({
    data: z.array(paymentPublicSchema),
  })
  .meta({
    title: "Get my payments response",
    description: "Get my payments response description",
    ref: "GetMyPaymentsResponseSchema",
  });

export type GetMyPaymentsResponse = z.infer<typeof getMyPaymentsResponseSchema>;
