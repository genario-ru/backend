import { z } from "@/lib/zod";

import { creditsPackagePaymentInfoSchema } from "../../entities/credits-package-payment-info";

export const initiateCreditsPackagePaymentResponseSchema = z
  .object({
    data: creditsPackagePaymentInfoSchema,
  })
  .meta({
    title: "Initiate credits package payment response",
    description: "Initiate credits package payment response description",
    ref: "InitiateCreditsPackagePaymentResponseSchema",
  });

export type InitiateCreditsPackagePaymentResponse = z.infer<
  typeof initiateCreditsPackagePaymentResponseSchema
>;
