import { createSelectSchema } from "drizzle-zod";

import { creditsBatch } from "@/db/schema";
import { subscriptionSchema } from "@/domains/subscriptions/schemas/entities/subscription";
import { z } from "@/lib/zod";

import { creditsPackageSchema } from "./credits-package";

export const creditsBatchSchema = createSelectSchema(creditsBatch).meta({
  title: "Credits batch",
  description: "Credits batch description",
  ref: "CreditsBatchSchema",
});

export type CreditsBatch = z.infer<typeof creditsBatchSchema>;

export const creditsBatchExtendedSchema = creditsBatchSchema
  .extend({
    subscription: subscriptionSchema.nullish(),
    creditsPackage: creditsPackageSchema.nullish(),
  })
  .meta({
    title: "Credits batch extended",
    description: "Credits batch extended description",
    ref: "CreditsBatchExtendedSchema",
  });

export type CreditsBatchExtended = z.infer<typeof creditsBatchExtendedSchema>;
