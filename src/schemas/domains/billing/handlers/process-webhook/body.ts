import { z } from "@/lib/zod";

import { paymentMethodWebhookDataSchema } from "../../entities/payment-method-webhook-data";
import { paymentWebhookDataSchema } from "../../entities/payment-webhook-data";
import { refundWebhookDataSchema } from "../../entities/refund-webhook-data";

export const processWebhookBodySchema = z
  .union([
    paymentWebhookDataSchema,
    refundWebhookDataSchema,
    paymentMethodWebhookDataSchema,
  ])
  .meta({
    title: "Process webhook body",
    description: "Process webhook body description",
    ref: "ProcessWebhookBodySchema",
  });

export type ProcessWebhookBody = z.infer<typeof processWebhookBodySchema>;
