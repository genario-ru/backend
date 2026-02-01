import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { user } from "../primary/user";
import { referralInvite } from "../referral/referral-invite";
import { plan } from "./plan";

export const planDiscountType = pgEnum("plan_discount_type", [
  "fixed",
  "percentage",
]);

export const planDiscount = pgTable("plan_discount", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  planId: uuid("plan_id").references(() => plan.id, {
    onUpdate: "cascade",
    onDelete: "cascade",
  }),
  type: planDiscountType("type").notNull(),
  value: integer("value").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  }),
  ...timestamps,
});

export const planDiscountRelations = relations(planDiscount, ({ one }) => ({
  user: one(user, {
    fields: [planDiscount.userId],
    references: [user.id],
  }),
  plan: one(plan, {
    fields: [planDiscount.planId],
    references: [plan.id],
  }),
  referralInvite: one(referralInvite),
}));
