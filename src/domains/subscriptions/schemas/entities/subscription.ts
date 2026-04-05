import { createSelectSchema } from "drizzle-zod";

import { subscription } from "@/db/schema";
import { tariffSchema } from "@/domains/tariffs/schemas/entities/tariff";
import { z } from "@/lib/zod";

export const subscriptionSchema = createSelectSchema(subscription).meta({
  title: "Subscription",
  description: "Subscription description",
  ref: "SubscriptionSchema",
});

export type Subscription = z.infer<typeof subscriptionSchema>;

export const subscriptionExtendedSchema = subscriptionSchema
  .extend({
    tariff: tariffSchema,
  })
  .meta({
    title: "Subscription extended",
    description: "Subscription extended description",
    ref: "SubscriptionExtendedSchema",
  });

export type SubscriptionExtended = z.infer<typeof subscriptionExtendedSchema>;
