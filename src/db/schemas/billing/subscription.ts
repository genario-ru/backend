import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { user } from "../primary/user";
import { tariff } from "./tariff";
import { tariffTrial } from "./tariff-trial";

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
  tariffId: uuid("tariff_id")
    .references(() => tariff.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  tariffTrialId: uuid("tariff_trial_id").references(() => tariffTrial.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
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
  nextBillingAt: date("next_billing_at", {
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
  tariff: one(tariff, {
    fields: [subscription.tariffId],
    references: [tariff.id],
  }),
  tariffTrial: one(tariffTrial, {
    fields: [subscription.tariffTrialId],
    references: [tariffTrial.id],
  }),
}));
