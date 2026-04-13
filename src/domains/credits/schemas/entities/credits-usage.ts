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
    batch: creditsBatchSchema,
  })
  .meta({
    title: "Credits usage extended",
    description: "Credits usage extended description",
    ref: "CreditsUsageExtendedSchema",
  });

export type CreditsUsageExtended = z.infer<typeof creditsUsageExtendedSchema>;
