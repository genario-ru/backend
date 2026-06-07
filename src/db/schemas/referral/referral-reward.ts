import { relations } from "drizzle-orm";
import { pgEnum, pgTable, real, text, uuid } from "drizzle-orm/pg-core";

import { uniqueSlug } from "@/db/constants/slug";
import { timestamps } from "@/db/constants/timestamps";

import { referralCode } from "./referral-code";

export const referralRewardType = pgEnum("referral_reward_type", [
  "credits",
  "tariff_discount",
]);

export const referralRewardUserType = pgEnum("referral_reward_user_type", [
  "referral_source",
  "referral_target",
]);

export const referralReward = pgTable("referral_reward", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: referralRewardType("type").notNull(),
  userType: referralRewardUserType("user_type").notNull(),
  value: real("value").notNull(),
  ...uniqueSlug(),
  ...timestamps,
});

export const platformRewardRelations = relations(
  referralReward,
  ({ many }) => ({
    referralCodes: many(referralCode),
  }),
);
