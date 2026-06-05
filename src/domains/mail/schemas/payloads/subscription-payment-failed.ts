import { z } from "@/lib/zod";

export const subscriptionPaymentFailedPayloadSchema = z.object({
  billingUrl: z.string().url(),
  tariffName: z.string().min(1),
  tariffPrice: z.number().nonnegative(),
});

export type SubscriptionPaymentFailedPayload = z.infer<
  typeof subscriptionPaymentFailedPayloadSchema
>;
