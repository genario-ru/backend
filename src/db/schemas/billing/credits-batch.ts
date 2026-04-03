import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { creditsBatchToPayment } from "../linking/credits-batch-to-payment";
import { subscriptionToCreditsBatch } from "../linking/subscription-to-credits-batch";
import { user } from "../primary/user";
import { referralInvite } from "../referral/referral-invite";
import { creditsPackage } from "./credits-package";

export const creditsBatchStatus = pgEnum("credits_batch_status", [
  "pending", // Пакет кредитов создан, но еще не оплачен
  "active", // Пакет кредитов активен
  "terminated", // Пакет кредитов недоступен для использования (например, был выполнен возврат платежа)
]);

export const creditsBatch = pgTable("credits_batch", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  creditsPackageId: uuid("credits_package_id")
    .references(() => creditsPackage.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  remainingAmount: integer("remaining_amount").notNull(),
  status: creditsBatchStatus("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  }),
  ...timestamps,
});

export const creditsBatchRelations = relations(creditsBatch, ({ one }) => ({
  user: one(user, {
    fields: [creditsBatch.userId],
    references: [user.id],
  }),
  creditsPackage: one(creditsPackage, {
    fields: [creditsBatch.creditsPackageId],
    references: [creditsPackage.id],
  }),
  referralInvite: one(referralInvite),
  creditsBatchToPayment: one(creditsBatchToPayment),
  subscriptionToCreditsBatch: one(subscriptionToCreditsBatch),
}));
