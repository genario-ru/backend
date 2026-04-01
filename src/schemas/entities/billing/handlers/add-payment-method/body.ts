import { z } from "@/lib/zod";

export const addPaymentMethodBodySchema = z
  .object({
    redirectPath: z.string().optional(),
  })
  .meta({
    title: "Add payment method body",
    description: "Add payment method body description",
    ref: "AddPaymentMethodBodySchema",
  });

export type AddPaymentMethodBody = z.infer<typeof addPaymentMethodBodySchema>;
