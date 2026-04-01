import { z } from "@/lib/zod";

export const deletePaymentMethodParamsSchema = z.object({
  paymentMethodId: z.uuid(),
});

export type DeletePaymentMethodParams = z.infer<
  typeof deletePaymentMethodParamsSchema
>;
