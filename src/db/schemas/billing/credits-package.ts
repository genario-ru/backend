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

import { creditsPackageToCreditsBatch } from "../linking/credits-package-to-credits-batch";
import { creditsPackageToPayment } from "../linking/credits-package-to-payment";
import { tariff } from "./tariff";

export const creditsPackage = pgTable("credits_package", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  price: real("price").notNull(),
  oldPrice: real("old_price"),
  forPurchase: boolean("for_purchase").notNull().default(false),
  ...timestamps,
});

export const creditsPackageRelations = relations(
  creditsPackage,
  ({ many }) => ({
    tariffs: many(tariff),
    creditsPackageToCreditsBatch: many(creditsPackageToCreditsBatch),
    creditsPackageToPayment: many(creditsPackageToPayment),
  }),
);
