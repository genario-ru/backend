import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { payment } from "../billing/payment";
import { subscription } from "../billing/subscription";

export const subscriptionToPayment = pgTable("subscription_to_payment", {
  id: uuid("id").defaultRandom().primaryKey(),
  subscriptionId: uuid("subscription_id").references(() => subscription.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  paymentId: uuid("payment_id").references(() => payment.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
});

export const subscriptionToPaymentRelations = relations(
  subscriptionToPayment,
  ({ one }) => ({
    subscription: one(subscription, {
      fields: [subscriptionToPayment.subscriptionId],
      references: [subscription.id],
    }),
    payment: one(payment, {
      fields: [subscriptionToPayment.paymentId],
      references: [payment.id],
    }),
  }),
);
