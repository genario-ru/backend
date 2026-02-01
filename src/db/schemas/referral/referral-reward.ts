import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { referralCode } from "./referral-code";

export const referralRewardType = pgEnum("referral_reward_type", [
  "credits",
  "plan_discount",
]);

export const referralRewardUserType = pgEnum("referral_reward_user_type", [
  "referral_source",
  "referral_target",
]);

export const referralReward = pgTable("referral_reward", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: referralRewardType("type").notNull(),
  userType: referralRewardUserType("user_type").notNull(),
  value: integer("value").notNull(),
  ...timestamps,
});

export const platformRewardRelations = relations(
  referralReward,
  ({ many }) => ({
    referralCodes: many(referralCode),
  }),
);
