import { z } from "@/lib/zod";

export const subscriptionPaymentInfoSchema = z.object({
  paymentLink: z.string(),
});

export type SubscriptionPaymentInfo = z.infer<
  typeof subscriptionPaymentInfoSchema
>;
