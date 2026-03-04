import { relations } from "drizzle-orm";
import { integer, interval, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { subscription } from "./subscription";

export const tariff = pgTable("tariff", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  creditsAmount: integer("credits_amount").notNull(),
  period: interval("period").notNull(),
  ...timestamps,
});

export const tariffRelations = relations(tariff, ({ many }) => ({
  subscriptions: many(subscription),
}));
