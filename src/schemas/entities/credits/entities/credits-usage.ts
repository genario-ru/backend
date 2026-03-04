import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { creditsUsage } from "@/db/schema";

import { userSchema } from "../../users/entities/user";
import { billingRegistry } from "../registry";
import { creditsBatchSchema } from "./credits-batch";
import { creditsCostSchema } from "./credits-cost";

export const creditsUsageSchema = createSelectSchema(creditsUsage).register(
  billingRegistry,
  {
    title: "Credits usage",
    description: "Credits usage description",
    ref: "CreditsUsageSchema",
  },
);

export type CreditsUsage = z.infer<typeof creditsUsageSchema>;

export const creditsUsageExtendedSchema = creditsUsageSchema
  .extend({
    user: userSchema,
    creditsBatch: creditsBatchSchema,
    creditsCost: creditsCostSchema,
  })
  .register(billingRegistry, {
    title: "Credits usage extended",
    description: "Credits usage extended description",
    ref: "CreditsUsageExtendedSchema",
  });
