import { z } from "@/lib/zod";

import { subscriptionPaymentInfoSchema } from "../../entities/subscription-payment-info";

export const initiateSubscriptionPaymentResponseSchema = z.object({
  data: subscriptionPaymentInfoSchema,
});

export type InitiateSubscriptionPaymentResponse = z.infer<
  typeof initiateSubscriptionPaymentResponseSchema
>;
