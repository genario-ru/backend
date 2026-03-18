import { relations } from "drizzle-orm";
import { pgEnum, pgTable, real, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { user } from "../primary/user";
import { referralInvite } from "../referral/referral-invite";
import { tariff } from "./tariff";

export const tariffDiscountType = pgEnum("tariff_discount_type", [
  "fixed",
  "percentage",
]);

export const tariffDiscount = pgTable("tariff_discount", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  tariffId: uuid("tariff_id").references(() => tariff.id, {
    onUpdate: "cascade",
    onDelete: "cascade",
  }),
  type: tariffDiscountType("type").notNull(),
  value: real("value").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  }),
  ...timestamps,
});

export const tariffDiscountRelations = relations(tariffDiscount, ({ one }) => ({
  user: one(user, {
    fields: [tariffDiscount.userId],
    references: [user.id],
  }),
  tariff: one(tariff, {
    fields: [tariffDiscount.tariffId],
    references: [tariff.id],
  }),
  referralInvite: one(referralInvite),
}));
