import { z } from "@/lib/zod";

import { paymentMethodSchema } from "../../entities/payment-method";

export const deletePaymentMethodResponseSchema = z
  .object({
    data: paymentMethodSchema,
  })
  .meta({
    title: "Delete payment method response",
    description: "Delete payment method response description",
    ref: "DeletePaymentMethodResponseSchema",
  });

export type DeletePaymentMethodResponse = z.infer<
  typeof deletePaymentMethodResponseSchema
>;
