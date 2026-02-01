import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { creditsBatch } from "../billing/credits-batch";
import { referralInvite } from "../referral/referral-invite";

export const referralInviteToCreditsBatch = pgTable(
  "referral_invite_to_credits_batch",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    referralInviteId: uuid("referral_invite_id")
      .references(() => referralInvite.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    creditsBatchId: uuid("credits_batch_id")
      .references(() => creditsBatch.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    ...timestamps,
  },
);

export const referralInviteToCreditsBatchRelations = relations(
  referralInviteToCreditsBatch,
  ({ one }) => ({
    referralInvite: one(referralInvite, {
      fields: [referralInviteToCreditsBatch.referralInviteId],
      references: [referralInvite.id],
    }),
    creditsBatch: one(creditsBatch, {
      fields: [referralInviteToCreditsBatch.creditsBatchId],
      references: [creditsBatch.id],
    }),
  }),
);
