import { relations } from "drizzle-orm";
import { index, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { payment } from "../billing/payment";
import { subscription } from "../billing/subscription";

export const subscriptionToPayment = pgTable(
  "subscription_to_payment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subscriptionId: uuid("subscription_id")
      .references(() => subscription.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    nextSubscriptionId: uuid("next_subscription_id").references(
      () => subscription.id,
      {
        onDelete: "set null",
        onUpdate: "cascade",
      },
    ),
    paymentId: uuid("payment_id")
      .references(() => payment.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
  },
  (table) => [
    index("subscription_to_payment_subscription_id_idx").on(
      table.subscriptionId,
    ),
    uniqueIndex("subscription_to_payment_payment_id_unique_idx").on(
      table.paymentId,
    ),
    index("subscription_to_payment_payment_id_idx").on(table.paymentId),
  ],
);

export const subscriptionToPaymentRelations = relations(
  subscriptionToPayment,
  ({ one }) => ({
    subscription: one(subscription, {
      fields: [subscriptionToPayment.subscriptionId],
      references: [subscription.id],
      relationName: "subscription",
    }),
    nextSubscription: one(subscription, {
      fields: [subscriptionToPayment.nextSubscriptionId],
      references: [subscription.id],
      relationName: "nextSubscription",
    }),
    payment: one(payment, {
      fields: [subscriptionToPayment.paymentId],
      references: [payment.id],
    }),
  }),
);
