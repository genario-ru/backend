import { refundSchema } from "@/codegen/api/yookassa";
import { z } from "@/lib/zod";

export const refundSucceededWebhookDataSchema = z
  .object({
    type: z.literal("notification"),
    event: z.literal("refund.succeeded"),
    object: refundSchema,
  })
  .meta({
    title: "Refund succeeded webhook data",
    description: "Refund succeeded webhook data description",
    ref: "RefundSucceededWebhookDataSchema",
  });

export type RefundSucceededWebhookData = z.infer<
  typeof refundSucceededWebhookDataSchema
>;

export const refundWebhookDataSchema = refundSucceededWebhookDataSchema.meta({
  title: "Refund webhook data",
  description: "Refund webhook data description",
  ref: "RefundWebhookDataSchema",
});

export type RefundWebhookData = z.infer<typeof refundWebhookDataSchema>;
