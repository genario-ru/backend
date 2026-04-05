import { z } from "@/lib/zod";

export const initiateCreditsPackagePaymentBodySchema = z
  .object({
    creditsPackageId: z.string(),
    redirect: z.string().optional(),
  })
  .meta({
    title: "Initiate credits package payment body",
    description: "Initiate credits package payment body description",
    ref: "InitiateCreditsPackagePaymentBodySchema",
  });

export type InitiateCreditsPackagePaymentBody = z.infer<
  typeof initiateCreditsPackagePaymentBodySchema
>;
