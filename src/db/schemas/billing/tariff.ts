import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { tariffToPayment } from "../linking/tariff-to-payment";
import { subscription } from "./subscription";

export const tariffBillingPeriod = pgEnum("tariff_billing_period", [
  "month",
  "year",
]);

export const tariffGenerationPriority = pgEnum("tariff_generation_priority", [
  "basic",
  "medium",
  "high",
]);

export const tariff = pgTable("tariff", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  oldPrice: real("old_price"),
  billingPeriod: tariffBillingPeriod("billing_period"),
  durationDays: integer("duration_days"),
  isRenewable: boolean("is_renewable").default(true).notNull(),
  isPreferred: boolean("is_preferred").default(false).notNull(),
  creditsAmount: integer("credits_amount").notNull(),
  maxProfilesAmount: integer("max_profiles_amount"),
  exportAvailable: boolean("export_available").default(false).notNull(),
  versionHistoryAvailable: boolean("version_history_available")
    .default(false)
    .notNull(),
  generationPriority: tariffGenerationPriority("generation_priority")
    .default("basic")
    .notNull(),
  ...timestamps,
});

export const tariffRelations = relations(tariff, ({ many }) => ({
  subscriptions: many(subscription),
  tariffToPayment: many(tariffToPayment),
}));
