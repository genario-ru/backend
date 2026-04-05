import { z } from "@/lib/zod";

export const initiateSubscriptionPaymentBodySchema = z
  .object({
    tariffSlug: z.string(),
    trialTariffSlug: z.string().optional(),
    redirect: z.string().optional(),
  })
  .meta({
    title: "Initiate subscription payment body",
    description: "Initiate subscription payment body description",
    ref: "InitiateSubscriptionPaymentBodySchema",
  });

export type InitiateSubscriptionPaymentBody = z.infer<
  typeof initiateSubscriptionPaymentBodySchema
>;
