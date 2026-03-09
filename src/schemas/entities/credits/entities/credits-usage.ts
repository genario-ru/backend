import { createSelectSchema } from "drizzle-zod";

import { creditsUsage } from "@/db/schema";
import { z } from "@/lib/zod";

import { userSchema } from "../../users/entities/user";
import { creditsRegistry } from "../registry";
import { creditsBatchSchema } from "./credits-batch";

export const creditsUsageSchema = createSelectSchema(creditsUsage).register(
  creditsRegistry,
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
  })
  .register(creditsRegistry, {
    title: "Credits usage extended",
    description: "Credits usage extended description",
    ref: "CreditsUsageExtendedSchema",
  });
