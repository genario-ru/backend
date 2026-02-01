import { relations } from "drizzle-orm";
import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { referralInviteToPlanDiscount } from "../linking/referral-invite-to-plan-discount";
import { user } from "../primary/user";
import { referralCode } from "./referral-code";

export const referralInviteRewardStatus = pgEnum("referral_invite_status", [
  "registered",
  "rewarded",
  "cancelled",
]);

export const referralInvite = pgTable("referral_invite", {
  id: uuid("id").defaultRandom().primaryKey(),
  rewardStatus: referralInviteRewardStatus("reward_status").notNull(),
  referralSourceUserId: uuid("referral_source_user_id")
    .references(() => user.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  referralTargetUserId: uuid("referral_target_user_id")
    .references(() => user.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  referralCodeId: uuid("referral_code_id")
    .references(() => referralCode.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  ...timestamps,
});

export const referralInviteRelations = relations(
  referralInvite,
  ({ one, many }) => ({
    referralSourceUser: one(user, {
      fields: [referralInvite.referralSourceUserId],
      references: [user.id],
    }),
    referralTargetUser: one(user, {
      fields: [referralInvite.referralTargetUserId],
      references: [user.id],
    }),
    referralCode: one(referralCode, {
      fields: [referralInvite.referralCodeId],
      references: [referralCode.id],
    }),
    referralInviteToPlanDiscount: many(referralInviteToPlanDiscount),
  }),
);
