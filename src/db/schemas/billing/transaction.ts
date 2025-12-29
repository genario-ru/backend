import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { user } from "../primary/user";

const transactionStatus = pgEnum("status", ["pending", "completed", "failed"]);
const transactionPaymentMethod = pgEnum("payment_method", ["card", "fps"]);

export const transaction = pgTable("transaction", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  paymentId: text("payment_id").notNull(),
  paymentProvider: text("payment_provider").notNull(),
  paymentMethod: transactionPaymentMethod("payment_method").notNull(),
  amount: integer("amount").notNull(),
  status: transactionStatus("status").notNull(),
  ...timestamps,
});

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
  }),
}));
