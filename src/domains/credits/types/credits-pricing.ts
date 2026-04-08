import type { creditsUsageEntity } from "@/db/schema";

export type CreditsPricingEntity =
  (typeof creditsUsageEntity.enumValues)[number];
