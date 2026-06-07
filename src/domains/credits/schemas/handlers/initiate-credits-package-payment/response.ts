import { paymentSchema } from "@/domains/billing/schemas/entities/payment";
import { z } from "@/lib/zod";

export const initiateCreditsPackagePaymentResponseSchema = z
  .object({
    data: paymentSchema,
  })
  .meta({
    title: "Initiate credits package payment response",
    description: "Initiate credits package payment response description",
    ref: "InitiateCreditsPackagePaymentResponseSchema",
  });

export type InitiateCreditsPackagePaymentResponse = z.infer<
  typeof initiateCreditsPackagePaymentResponseSchema
>;
