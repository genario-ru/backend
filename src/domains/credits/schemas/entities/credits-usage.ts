import { createSelectSchema } from "drizzle-zod";

import { creditsUsage } from "@/db/schema";
import { z } from "@/lib/zod";

import { creditsBatchSchema } from "./credits-batch";

export const creditsUsageSchema = createSelectSchema(creditsUsage).meta({
  title: "Credits usage",
  description: "Credits usage description",
  ref: "CreditsUsageSchema",
});

export type CreditsUsage = z.infer<typeof creditsUsageSchema>;

export const creditsUsageExtendedSchema = creditsUsageSchema
  .extend({
    creditsBatch: creditsBatchSchema,
  })
  .meta({
    title: "Credits usage extended",
    description: "Credits usage extended description",
    ref: "CreditsUsageExtendedSchema",
  });

export type CreditsUsageExtended = z.infer<typeof creditsUsageExtendedSchema>;

export const creditsUsagePublicSchema = creditsUsageSchema
  .omit({
    creditPrice: true,
    totalPrice: true,
  })
  .meta({
    title: "Credits usage (public)",
    description: "Credits usage without pricing fields",
    ref: "CreditsUsagePublicSchema",
  });

export type CreditsUsagePublic = z.infer<typeof creditsUsagePublicSchema>;

export const creditsUsagePublicExtendedSchema = creditsUsagePublicSchema
  .extend({
    creditsBatch: creditsBatchSchema,
  })
  .meta({
    title: "Credits usage extended (public)",
    description: "Credits usage extended without pricing fields",
    ref: "CreditsUsagePublicExtendedSchema",
  });

export type CreditsUsagePublicExtended = z.infer<
  typeof creditsUsagePublicExtendedSchema
>;
