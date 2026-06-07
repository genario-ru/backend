import { z } from "@/lib/zod";

export const getPaymentParamsSchema = z.object({
  paymentId: z.uuid(),
});

export type GetPaymentParams = z.infer<typeof getPaymentParamsSchema>;
