import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { subscription } from "./subscription";
import { tariff } from "./tariff";

export const tariffTrial = pgTable("tariff_trial", {
  id: uuid("id").defaultRandom().primaryKey(),
  tariffId: uuid("tariff_id").references(() => tariff.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  price: integer("price").notNull(),
  creditsAmount: integer("credits_amount").notNull(),
  active: boolean("active").default(true).notNull(),
  firstTimeOnly: boolean("first_time_only").default(true).notNull(),
  durationDays: integer("duration_days").notNull(),
  ...timestamps,
});

export const tariffTrialRelations = relations(tariffTrial, ({ one, many }) => ({
  tariff: one(tariff, {
    fields: [tariffTrial.tariffId],
    references: [tariff.id],
  }),
  subscription: many(subscription),
}));
