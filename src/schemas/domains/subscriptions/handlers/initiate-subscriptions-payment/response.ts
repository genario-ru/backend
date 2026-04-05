import { z } from "@/lib/zod";

import { subscriptionPaymentInfoSchema } from "../../entities/subscription-payment-info";

export const initiateSubscriptionPaymentResponseSchema = z
  .object({
    data: subscriptionPaymentInfoSchema,
  })
  .meta({
    title: "Initiate subscription payment response",
    description: "Initiate subscription payment response description",
    ref: "InitiateSubscriptionPaymentResponseSchema",
  });

export type InitiateSubscriptionPaymentResponse = z.infer<
  typeof initiateSubscriptionPaymentResponseSchema
>;
