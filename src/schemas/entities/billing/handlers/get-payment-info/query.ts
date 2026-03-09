import { z } from "@/lib/zod";

export const getPaymentInfoQuerySchema = z.object({
  tariffSlug: z.string(),
  trialTariffSlug: z.string().optional(),
  redirect: z.string().optional(),
});

export type GetPaymentInfoQuery = z.infer<typeof getPaymentInfoQuerySchema>;
