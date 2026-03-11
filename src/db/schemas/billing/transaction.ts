import { relations } from "drizzle-orm";
import { decimal, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { user } from "../primary/user";

export const transactionStatus = pgEnum("transaction_status", [
  "pending",
  "completed",
  "failed",
]);

export const transactionPaymentMethod = pgEnum("transaction_payment_method", [
  "card",
  "sbp",
]);

export const transaction = pgTable("transaction", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  amount: decimal("amount").notNull(),
  paymentId: text("payment_id").notNull(),
  paymentProvider: text("payment_provider").notNull(),
  paymentMethod: transactionPaymentMethod("payment_method").notNull(),
  status: transactionStatus("status").notNull(),
  ...timestamps,
});

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
  }),
}));
