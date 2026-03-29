import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { payment } from "../billing/payment";
import { tariff } from "../billing/tariff";

export const tariffToPayment = pgTable("tariff_to_payment", {
  id: uuid("id").defaultRandom().primaryKey(),
  tariffId: uuid("tariff_id").references(() => tariff.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  paymentId: uuid("payment_id").references(() => payment.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
});

export const tariffToPaymentRelations = relations(
  tariffToPayment,
  ({ one }) => ({
    tariff: one(tariff, {
      fields: [tariffToPayment.tariffId],
      references: [tariff.id],
    }),
    payment: one(payment, {
      fields: [tariffToPayment.paymentId],
      references: [payment.id],
    }),
  }),
);
