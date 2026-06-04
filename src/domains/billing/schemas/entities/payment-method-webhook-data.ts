import { paymentSchema } from "@/codegen/api/yookassa";
import { z } from "@/lib/zod";

export const paymentMethodActiveWebhookDataSchema = z
  .object({
    type: z.literal("notification"),
    event: z.literal("payment_method.active"),
    object: paymentSchema.shape.payment_method,
  })
  .meta({
    title: "Payment method active webhook data",
    description: "Payment method active webhook data description",
    ref: "PaymentMethodActiveWebhookDataSchema",
  });

export type PaymentMethodActiveWebhookData = z.infer<
  typeof paymentMethodActiveWebhookDataSchema
>;

export const paymentMethodWebhookDataSchema =
  paymentMethodActiveWebhookDataSchema.meta({
    title: "Payment method webhook data",
    description: "Payment method webhook data description",
    ref: "PaymentMethodWebhookDataSchema",
  });

export type PaymentMethodWebhookData = z.infer<
  typeof paymentMethodWebhookDataSchema
>;
