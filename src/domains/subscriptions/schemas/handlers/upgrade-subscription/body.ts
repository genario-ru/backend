import { z } from "@/lib/zod";

export const upgradeSubscriptionBodySchema = z
  .object({
    newTariffId: z.string(),
  })
  .meta({
    title: "Upgrade subscription body",
    description: "Upgrade subscription body description",
    ref: "UpgradeSubscriptionBodySchema",
  });

export type UpgradeSubscriptionBody = z.infer<
  typeof upgradeSubscriptionBodySchema
>;
