import { z } from "@/lib/zod";

import { paymentInfoSchema } from "../../entities/payment-info";

export const getPaymentInfoResponseSchema = z.object({
  data: paymentInfoSchema,
});

export type GetPaymentInfoResponse = z.infer<
  typeof getPaymentInfoResponseSchema
>;
