import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { subscriptionToCreditsBatch } from "../linking/subscription-to-credits-batch";
import { user } from "../primary/user";

export const creditsBatch = pgTable("credits_batch", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  sourceType: text("source_type").notNull(),
  initialAmount: integer("initial_amount").notNull(),
  remainingAmount: integer("remaining_amount").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  }),
  ...timestamps,
});

export const creditsBatchRelations = relations(
  creditsBatch,
  ({ one, many }) => ({
    user: one(user, {
      fields: [creditsBatch.userId],
      references: [user.id],
    }),
    subscriptionToCreditsBatch: many(subscriptionToCreditsBatch),
  }),
);
