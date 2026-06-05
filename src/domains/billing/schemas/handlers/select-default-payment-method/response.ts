import { z } from "@/lib/zod";

import { paymentMethodSchema } from "../../entities/payment-method";

export const selectDefaultPaymentMethodResponseSchema = z
  .object({
    data: paymentMethodSchema,
  })
  .meta({
    title: "Select default payment method response",
    description: "Select default payment method response description",
    ref: "SelectDefaultPaymentMethodResponseSchema",
  });

export type SelectDefaultPaymentMethodResponse = z.infer<
  typeof selectDefaultPaymentMethodResponseSchema
>;
