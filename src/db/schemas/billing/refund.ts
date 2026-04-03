import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { payment } from "./payment";

export const refundStatus = pgEnum("refund_status", [
  "pending",
  "succeeded",
  "canceled",
  "failed",
]);

export const refund = pgTable("refund", {
  id: uuid("id").defaultRandom().primaryKey(),
  externalId: text("external_id").unique().notNull(),
  paymentId: uuid("payment_id")
    .references(() => payment.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  status: refundStatus("status").notNull(),
  statusDetails: text("status_details"),
  ...timestamps,
});

export const refundRelations = relations(refund, ({ one }) => ({
  payment: one(payment, {
    fields: [refund.paymentId],
    references: [payment.id],
  }),
}));
