import { relations } from "drizzle-orm";
import { boolean, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { user } from "../primary/user";
import { plan } from "./plan";

export const subscriptionStatus = pgEnum("subscription_status", [
  "active",
  "overdue",
  "cancelled",
]);

export const subscription = pgTable("subscription", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  planId: uuid("plan_id")
    .references(() => plan.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  startsAt: timestamp("starts_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  endsAt: timestamp("ends_at", {
    withTimezone: true,
    mode: "string",
  }),
  lastBilledAt: timestamp("last_billed_at", {
    withTimezone: true,
    mode: "string",
  }),
  nextBillingAt: timestamp("next_billing_at", {
    withTimezone: true,
    mode: "string",
  }),
  status: subscriptionStatus("status").default("active"),
  isTrial: boolean("is_trial").notNull(),
  ...timestamps,
});

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
  plan: one(plan, {
    fields: [subscription.planId],
    references: [plan.id],
  }),
}));
