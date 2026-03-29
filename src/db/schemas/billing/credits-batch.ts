import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { creditsPackageToCreditsBatch } from "../linking/credits-package-to-credits-batch";
import { subscriptionToCreditsBatch } from "../linking/subscription-to-credits-batch";
import { user } from "../primary/user";
import { referralInvite } from "../referral/referral-invite";

export const creditsBatch = pgTable("credits_batch", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  initialAmount: integer("initial_amount").notNull(),
  remainingAmount: integer("remaining_amount").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  }),
  ...timestamps,
});

export const creditsBatchRelations = relations(creditsBatch, ({ one }) => ({
  user: one(user, {
    fields: [creditsBatch.userId],
    references: [user.id],
  }),
  referralInvite: one(referralInvite),
  subscriptionToCreditsBatch: one(subscriptionToCreditsBatch),
  creditsPackageToCreditsBatch: one(creditsPackageToCreditsBatch),
}));
