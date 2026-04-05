import { paymentSchema } from "@/codegen/api/yookassa";
import { z } from "@/lib/zod";

export const paymentSucceededWebhookDataSchema = z
  .object({
    type: z.literal("notification"),
    event: z.literal("payment.succeeded"),
    object: paymentSchema,
  })
  .meta({
    title: "Payment succeeded webhook data",
    description: "Payment succeeded webhook data description",
    ref: "PaymentSucceededWebhookDataSchema",
  });

export type PaymentSucceededWebhookData = z.infer<
  typeof paymentSucceededWebhookDataSchema
>;

export const paymentCanceledWebhookDataSchema = z
  .object({
    type: z.literal("notification"),
    event: z.literal("payment.canceled"),
    object: paymentSchema,
  })
  .meta({
    title: "Payment canceled webhook data",
    description: "Payment canceled webhook data description",
    ref: "PaymentCanceledWebhookDataSchema",
  });

export type PaymentCanceledWebhookData = z.infer<
  typeof paymentCanceledWebhookDataSchema
>;

export const paymentWebhookDataSchema = z
  .union([paymentSucceededWebhookDataSchema, paymentCanceledWebhookDataSchema])
  .meta({
    title: "Payment webhook data",
    description: "Payment webhook data description",
    ref: "PaymentWebhookDataSchema",
  });

export type PaymentWebhookData = z.infer<typeof paymentWebhookDataSchema>;
