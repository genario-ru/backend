import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { planDiscount } from "../billing/plan-discount";
import { referralInvite } from "../referral/referral-invite";

export const referralInviteToPlanDiscount = pgTable(
  "referral_invite_to_plan_discount",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    referralInviteId: uuid("referral_invite_id")
      .references(() => referralInvite.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    planDiscountId: uuid("plan_discount_id")
      .references(() => planDiscount.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    ...timestamps,
  },
);

export const referralInviteToPlanDiscountRelations = relations(
  referralInviteToPlanDiscount,
  ({ one }) => ({
    referralInvite: one(referralInvite, {
      fields: [referralInviteToPlanDiscount.referralInviteId],
      references: [referralInvite.id],
    }),
    planDiscount: one(planDiscount, {
      fields: [referralInviteToPlanDiscount.planDiscountId],
      references: [planDiscount.id],
    }),
  }),
);
