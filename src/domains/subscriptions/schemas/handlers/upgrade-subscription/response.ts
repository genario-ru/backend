import { z } from "@/lib/zod";

import { subscriptionSchema } from "../../entities/subscription";

export const upgradeSubscriptionResponseSchema = z
  .object({
    data: subscriptionSchema,
  })
  .meta({
    title: "Upgrade subscription response",
    description: "Upgrade subscription response description",
    ref: "UpgradeSubscriptionResponseSchema",
  });

export type UpgradeSubscriptionResponse = z.infer<
  typeof upgradeSubscriptionResponseSchema
>;
