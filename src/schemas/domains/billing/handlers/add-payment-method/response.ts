import { z } from "@/lib/zod";

export const addPaymentMethodResponseSchema = z
  .object({
    data: z.object({
      confirmationUrl: z.string(),
    }),
  })
  .meta({
    title: "Add payment method response",
    description: "Add payment method response description",
    ref: "AddPaymentMethodResponseSchema",
  });

export type AddPaymentMethodResponse = z.infer<
  typeof addPaymentMethodResponseSchema
>;
