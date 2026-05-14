import { relations } from "drizzle-orm";
import { index, pgTable, uuid } from "drizzle-orm/pg-core";

import { creditsBatch } from "../billing/credits-batch";
import { payment } from "../billing/payment";

export const creditsBatchToPayment = pgTable(
  "credits_batch_to_payment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creditsBatchId: uuid("credits_batch_id").references(() => creditsBatch.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    paymentId: uuid("payment_id").references(() => payment.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
  (table) => [
    index("credits_batch_to_payment_credits_batch_id_idx").on(
      table.creditsBatchId,
    ),
    index("credits_batch_to_payment_payment_id_idx").on(table.paymentId),
  ],
);

export const creditsBatchToPaymentRelations = relations(
  creditsBatchToPayment,
  ({ one }) => ({
    creditsBatch: one(creditsBatch, {
      fields: [creditsBatchToPayment.creditsBatchId],
      references: [creditsBatch.id],
    }),
    payment: one(payment, {
      fields: [creditsBatchToPayment.paymentId],
      references: [payment.id],
    }),
  }),
);
