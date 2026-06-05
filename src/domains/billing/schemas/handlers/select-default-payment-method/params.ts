import { z } from "@/lib/zod";

export const selectDefaultPaymentMethodParamsSchema = z.object({
  paymentMethodId: z.uuid(),
});

export type SelectDefaultPaymentMethodParams = z.infer<
  typeof selectDefaultPaymentMethodParamsSchema
>;
