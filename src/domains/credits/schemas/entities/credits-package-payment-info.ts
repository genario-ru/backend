import { z } from "@/lib/zod";

export const creditsPackagePaymentInfoSchema = z.object({
  paymentLink: z.string(),
});

export type CreditsPackagePaymentInfo = z.infer<
  typeof creditsPackagePaymentInfoSchema
>;
