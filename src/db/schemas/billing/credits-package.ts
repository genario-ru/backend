import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  real,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { creditsBatch } from "./credits-batch";
import { tariff } from "./tariff";

export const creditsPackage = pgTable("credits_package", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  price: real("price").notNull(),
  oldPrice: real("old_price"),
  forPurchase: boolean("for_purchase").notNull().default(false),
  isPreferred: boolean("is_preferred").default(false).notNull(),
  ...timestamps,
});

export const creditsPackageRelations = relations(
  creditsPackage,
  ({ many }) => ({
    tariffs: many(tariff),
    creditsBatches: many(creditsBatch),
  }),
);
