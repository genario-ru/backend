import { relations } from "drizzle-orm";
import { index, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";
import {
  generateReferralCode,
  REFERRAL_CODE_LENGTH,
} from "@/db/utils/generate-referral-code";

import { user } from "../primary/user";
import { referralInvite } from "./referral-invite";
import { referralReward } from "./referral-reward";

export const referralCode = pgTable(
  "referral_code",
  {
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
    code: varchar("code", { length: REFERRAL_CODE_LENGTH })
      .unique()
      .notNull()
      .$defaultFn(() => generateReferralCode()),
    ...timestamps,
  },
  (table) => [
    index("referral_code_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("referral_code_reward_id_idx").on(table.referralRewardId),
  ],
);

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
