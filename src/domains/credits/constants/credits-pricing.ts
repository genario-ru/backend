import type { CreditsPricingEntity } from "../types/credits-pricing";

export const creditsPricing: Record<CreditsPricingEntity, number> = {
  "ideas-list": 1,
  "scenario-chapters": 1,
  "scenario-chapter-scenes": 1,
  "scenario-scene-preview": 5,
  "scenario-metadata": 2,
} as const;
