import { z } from "@/lib/zod";
import { internalRedirectPathSchema } from "@/shared/schemas/common/internal-redirect-path";

export const initiateSubscriptionPaymentBodySchema = z
  .object({
    tariffSlug: z.string(),
    trialTariffSlug: z.string().optional(),
    redirect: internalRedirectPathSchema.optional(),
  })
  .meta({
    title: "Initiate subscription payment body",
    description: "Initiate subscription payment body description",
    ref: "InitiateSubscriptionPaymentBodySchema",
  });

export type InitiateSubscriptionPaymentBody = z.infer<
  typeof initiateSubscriptionPaymentBodySchema
>;
