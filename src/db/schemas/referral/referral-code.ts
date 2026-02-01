import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { user } from "../primary/user";
import { referralInvite } from "./referral-invite";
import { referralReward } from "./referral-reward";

export const referralCode = pgTable("referral_code", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  referralRewardId: uuid("referral_reward_id")
    .references(() => referralReward.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  code: varchar("code", { length: 12 }).unique().notNull(),
  ...timestamps,
});

export const referralCodeRelations = relations(
  referralCode,
  ({ one, many }) => ({
    user: one(user, {
      fields: [referralCode.userId],
      references: [user.id],
    }),
    referralReward: one(referralReward, {
      fields: [referralCode.referralRewardId],
      references: [referralReward.id],
    }),
    referralInvites: many(referralInvite),
  }),
);
