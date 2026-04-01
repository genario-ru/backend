import { z } from "@/lib/zod";

export const deletePaymentMethodBodySchema = z
  .object({
    paymentMethodId: z.uuid(),
  })
  .meta({
    title: "Delete payment method body",
    description: "Delete payment method body description",
    ref: "DeletePaymentMethodBodySchema",
  });

export type DeletePaymentMethodBody = z.infer<
  typeof deletePaymentMethodBodySchema
>;
