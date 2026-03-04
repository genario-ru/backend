import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { subscription } from "./subscription";

export const tariffBillingPeriod = pgEnum("tariff_billing_period", [
  "month",
  "year",
]);

export const tariff = pgTable("tariff", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  creditsAmount: integer("credits_amount").notNull(),
  billingPeriod: tariffBillingPeriod("billing_period").default("month"),
  priority: boolean("priority").default(false).notNull(),
  ...timestamps,
});

export const tariffRelations = relations(tariff, ({ many }) => ({
  subscriptions: many(subscription),
}));
