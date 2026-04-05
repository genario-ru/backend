import { z } from "@/lib/zod";

import { paymentMethodSchema } from "../../entities/payment-method";

export const getMyPaymentMethodsResponseSchema = z
  .object({
    data: z.array(paymentMethodSchema),
  })
  .meta({
    title: "Get my payment methods response",
    description: "Get my payment methods response description",
    ref: "GetMyPaymentMethodsResponseSchema",
  });

export type GetMyPaymentMethodsResponse = z.infer<
  typeof getMyPaymentMethodsResponseSchema
>;
