import { relations } from "drizzle-orm";
import { pgEnum, pgTable, real, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { creditsPackageToPayment } from "../linking/credits-package-to-payment";
import { tariffToPayment } from "../linking/tariff-to-payment";
import { user } from "../primary/user";
import { paymentMethod } from "./payment-method";

export const paymentEntity = pgEnum("payment_entity", [
  "tariff",
  "credits_package",
]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "canceled",
]);

export const payment = pgTable("payment", {
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
  ...timestamps,
});

export const paymentRelations = relations(payment, ({ one, many }) => ({
  user: one(user, {
    fields: [payment.userId],
    references: [user.id],
  }),
  paymentMethod: one(paymentMethod, {
    fields: [payment.paymentMethodId],
    references: [paymentMethod.id],
  }),
  tariffToPayment: many(tariffToPayment),
  creditsPackageToPayment: many(creditsPackageToPayment),
}));
