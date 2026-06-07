import { paymentSchema } from "@/domains/billing/schemas/entities/payment";
import { z } from "@/lib/zod";

export const initiateSubscriptionPaymentResponseSchema = z
  .object({
    data: paymentSchema,
  })
  .meta({
    title: "Initiate subscription payment response",
    description: "Initiate subscription payment response description",
    ref: "InitiateSubscriptionPaymentResponseSchema",
  });

export type InitiateSubscriptionPaymentResponse = z.infer<
  typeof initiateSubscriptionPaymentResponseSchema
>;
