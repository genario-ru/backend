import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { creditsBatch } from "../billing/credits-batch";
import { subscription } from "../billing/subscription";

export const subscriptionToCreditsBatch = pgTable(
  "subscription_to_credits_batch",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subscriptionId: uuid("subscription_id")
      .references(() => subscription.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    creditsBatchId: uuid("credits_batch_id")
      .references(() => creditsBatch.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    ...timestamps,
  },
);

export const subscriptionToCreditsBatchRelations = relations(
  subscriptionToCreditsBatch,
  ({ one }) => ({
    subscription: one(subscription, {
      fields: [subscriptionToCreditsBatch.subscriptionId],
      references: [subscription.id],
    }),
    creditsBatch: one(creditsBatch, {
      fields: [subscriptionToCreditsBatch.creditsBatchId],
      references: [creditsBatch.id],
    }),
  }),
);
