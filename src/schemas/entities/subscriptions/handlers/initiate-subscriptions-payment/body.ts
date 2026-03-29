import { z } from "@/lib/zod";

export const initiateSubscriptionPaymentBodySchema = z.object({
  tariffSlug: z.string(),
  trialTariffSlug: z.string().optional(),
  redirect: z.string().optional(),
});

export type InitiateSubscriptionPaymentBody = z.infer<
  typeof initiateSubscriptionPaymentBodySchema
>;
