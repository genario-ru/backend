import { z } from "@/lib/zod";
import { internalRedirectPathSchema } from "@/shared/schemas/common/internal-redirect-path";

export const initiateCreditsPackagePaymentBodySchema = z
  .object({
    creditsPackageSlug: z.string(),
    redirect: internalRedirectPathSchema.optional(),
  })
  .meta({
    title: "Initiate credits package payment body",
    description: "Initiate credits package payment body description",
    ref: "InitiateCreditsPackagePaymentBodySchema",
  });

export type InitiateCreditsPackagePaymentBody = z.infer<
  typeof initiateCreditsPackagePaymentBodySchema
>;
