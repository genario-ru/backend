import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { applicationToProductFeature } from "../linking/application-to-product-feature";

export const productFeature = pgTable("product_feature", {
  id: uuid("id").defaultRandom().primaryKey(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  available: boolean("available").notNull().default(false),
  priority: integer("priority").notNull().default(0),
  ...timestamps,
});

export const productFeatureRelations = relations(
  productFeature,
  ({ many }) => ({
    applicationToProductFeature: many(applicationToProductFeature),
  }),
);
