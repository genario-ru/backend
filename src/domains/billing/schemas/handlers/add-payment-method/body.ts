import { z } from "@/lib/zod";
import { internalRedirectPathSchema } from "@/shared/schemas/common/internal-redirect-path";

export const addPaymentMethodBodySchema = z
  .object({
    redirectPath: internalRedirectPathSchema.optional(),
  })
  .meta({
    title: "Add payment method body",
    description: "Add payment method body description",
    ref: "AddPaymentMethodBodySchema",
  });

export type AddPaymentMethodBody = z.infer<typeof addPaymentMethodBodySchema>;
