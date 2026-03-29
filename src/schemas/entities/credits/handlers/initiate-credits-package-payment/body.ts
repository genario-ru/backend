import { z } from "@/lib/zod";

export const initiateCreditsPackagePaymentBodySchema = z.object({
  creditsPackageId: z.string(),
  redirect: z.string().optional(),
});

export type InitiateCreditsPackagePaymentBody = z.infer<
  typeof initiateCreditsPackagePaymentBodySchema
>;
