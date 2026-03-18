import { z } from "@/lib/zod";

import { paymentInfoSchema } from "../../entities/payment-info";

export const initiatePaymentResponseSchema = z.object({
  data: paymentInfoSchema,
});

export type InitiatePaymentResponse = z.infer<
  typeof initiatePaymentResponseSchema
>;
