import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  real,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { creditsBatchToPayment } from "../linking/credits-batch-to-payment";
import { subscriptionToPayment } from "../linking/subscription-to-payment";
import { user } from "../primary/user";
import { paymentMethod } from "./payment-method";
import { refund } from "./refund";

export const paymentEntity = pgEnum("payment_entity", [
  "tariff",
  "credits_package",
]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "canceled",
  "failed",
]);

export const payment = pgTable(
  "payment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
      .notNull(),
    paymentMethodId: uuid("payment_method_id").references(
      () => paymentMethod.id,
      {
        onUpdate: "cascade",
        onDelete: "set null",
      },
    ),
    paymentId: text("payment_id").notNull(),
    paymentLink: text("payment_link"),
    amount: real("amount").notNull(),
    currency: text("currency").notNull(),
    status: paymentStatus("status").notNull(),
    statusDetails: text("status_details"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("payment_payment_id_unique_idx").on(table.paymentId),
    index("payment_payment_id_idx").on(table.paymentId),
    index("payment_user_id_created_at_idx").on(table.userId, table.createdAt),
    index("payment_user_id_status_created_at_idx").on(
      table.userId,
      table.status,
      table.createdAt,
    ),
    index("payment_payment_method_id_idx").on(table.paymentMethodId),
  ],
);

export const paymentRelations = relations(payment, ({ one }) => ({
  user: one(user, {
    fields: [payment.userId],
    references: [user.id],
  }),
  paymentMethod: one(paymentMethod, {
    fields: [payment.paymentMethodId],
    references: [paymentMethod.id],
  }),
  refund: one(refund),
  subscriptionToPayment: one(subscriptionToPayment),
  creditsBatchToPayment: one(creditsBatchToPayment),
}));
