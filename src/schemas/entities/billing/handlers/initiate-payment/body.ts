import { z } from "@/lib/zod";

export const initiatePaymentBodySchema = z.object({
  tariffSlug: z.string(),
  trialTariffSlug: z.string().optional(),
  redirect: z.string().optional(),
});

export type InitiatePaymentBody = z.infer<typeof initiatePaymentBodySchema>;
