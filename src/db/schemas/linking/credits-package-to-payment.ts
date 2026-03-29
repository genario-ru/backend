import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { creditsPackage } from "../billing/credits-package";
import { payment } from "../billing/payment";

export const creditsPackageToPayment = pgTable("credits_package_to_payment", {
  id: uuid("id").defaultRandom().primaryKey(),
  creditsPackageId: uuid("credits_package_id").references(
    () => creditsPackage.id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  ),
  paymentId: uuid("payment_id").references(() => payment.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
});

export const creditsPackageToPaymentRelations = relations(
  creditsPackageToPayment,
  ({ one }) => ({
    creditsPackage: one(creditsPackage, {
      fields: [creditsPackageToPayment.creditsPackageId],
      references: [creditsPackage.id],
    }),
    payment: one(payment, {
      fields: [creditsPackageToPayment.paymentId],
      references: [payment.id],
    }),
  }),
);
