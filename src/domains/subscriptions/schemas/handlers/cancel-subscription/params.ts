import { z } from "@/lib/zod";

export const cancelSubscriptionParamsSchema = z.object({
  subscriptionId: z.uuid(),
});

export type CancelSubscriptionParams = z.infer<
  typeof cancelSubscriptionParamsSchema
>;
