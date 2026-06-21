import { relations } from "drizzle-orm";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { applicationToProductFeature } from "../linking/application-to-product-feature";

export const application = pgTable("application", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  comment: text("comment"),
  marketingAccepted: boolean("marketing_accepted").notNull().default(false),
  ...timestamps,
});

export const applicationRelations = relations(application, ({ many }) => ({
  applicationToProductFeature: many(applicationToProductFeature),
}));
