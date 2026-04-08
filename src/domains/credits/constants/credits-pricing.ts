import type { CreditsPricingEntity } from "../types/credits-pricing";

export const creditsPricing: Record<CreditsPricingEntity, number> = {
  "scenario": 10,
  "scenario-scene-preview": 5,
  "ideas-list": 1,
} as const;
