import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { creditsBatch } from "../billing/credits-batch";
import { tariffDiscount } from "../billing/tariff-discount";
import { user } from "../primary/user";
import { referralCode } from "./referral-code";

export const referralInviteRewardStatus = pgEnum("referral_invite_status", [
  "registered",
  "rewarded",
  "cancelled",
]);

export const referralInvite = pgTable(
  "referral_invite",
  {
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
    creditsBatchId: uuid("credits_batch_id").references(() => creditsBatch.id, {
      onUpdate: "cascade",
      onDelete: "set null",
    }),
    tariffDiscountId: uuid("tariff_discount_id").references(
      () => tariffDiscount.id,
      {
        onUpdate: "cascade",
        onDelete: "set null",
      },
    ),
    ...timestamps,
  },
  (table) => [
    index("referral_invite_source_user_created_at_idx").on(
      table.referralSourceUserId,
      table.createdAt,
    ),
    index("referral_invite_source_user_updated_at_idx").on(
      table.referralSourceUserId,
      table.updatedAt,
    ),
    index("referral_invite_target_user_id_idx").on(table.referralTargetUserId),
    index("referral_invite_code_id_idx").on(table.referralCodeId),
  ],
);

export const referralInviteRelations = relations(referralInvite, ({ one }) => ({
  referralSourceUser: one(user, {
    relationName: "referralSourceUser",
    fields: [referralInvite.referralSourceUserId],
    references: [user.id],
  }),
  referralTargetUser: one(user, {
    relationName: "referralTargetUser",
    fields: [referralInvite.referralTargetUserId],
    references: [user.id],
  }),
  referralCode: one(referralCode, {
    fields: [referralInvite.referralCodeId],
    references: [referralCode.id],
  }),
  creditsBatch: one(creditsBatch, {
    fields: [referralInvite.creditsBatchId],
    references: [creditsBatch.id],
  }),
  tariffDiscount: one(tariffDiscount, {
    fields: [referralInvite.tariffDiscountId],
    references: [tariffDiscount.id],
  }),
}));
