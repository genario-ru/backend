import { z } from "@/lib/zod";

export const triggerSubscriptionsChargeResponseSchema = z
  .object({
    data: z.object({
      jobId: z.string().nullable(),
    }),
  })
  .meta({
    title: "Trigger subscriptions charge response",
    description: "Trigger subscriptions charge response description",
    ref: "TriggerSubscriptionsChargeResponseSchema",
  });

export type TriggerSubscriptionsChargeResponse = z.infer<
  typeof triggerSubscriptionsChargeResponseSchema
>;
