import { z } from "@/lib/zod";

import { subscriptionSchema } from "../../entities/subscription";

export const cancelSubscriptionResponseSchema = z
  .object({
    data: subscriptionSchema,
  })
  .meta({
    title: "Cancel subscription response",
    description: "Cancel subscription response description",
    ref: "CancelSubscriptionResponseSchema",
  });

export type CancelSubscriptionResponse = z.infer<
  typeof cancelSubscriptionResponseSchema
>;
