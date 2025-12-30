import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { subscription } from "@/db/schema";

import { planSchema } from "../../plans/entities/plan";
import { subscriptionsRegistry } from "../registry";

export const subscriptionSchema = createSelectSchema(subscription).register(
  subscriptionsRegistry,
  {
    title: "Subscription",
    description: "Subscription description",
    ref: "SubscriptionSchema",
  },
);

export type Subscription = z.infer<typeof subscriptionSchema>;

export const subscriptionExtendedSchema = subscriptionSchema
  .extend({
    plan: planSchema,
  })
  .register(subscriptionsRegistry, {
    title: "Subscription extended",
    description: "Subscription extended description",
    ref: "SubscriptionExtendedSchema",
  });

export type SubscriptionExtended = z.infer<typeof subscriptionExtendedSchema>;
