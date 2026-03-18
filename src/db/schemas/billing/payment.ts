import { relations } from "drizzle-orm";
import { decimal, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { user } from "../primary/user";

export const paymentEntity = pgEnum("payment_entity", [
  "tariff",
  "credits_package",
]);

export const payment = pgTable("payment", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  amount: decimal("amount").notNull(),
  entity: paymentEntity("entity").notNull(),
  entityId: uuid("entity_id").notNull(),
  paymentId: text("payment_id").notNull(),
  paymentMethod: text("payment_method"),
  status: text("status").notNull(),
  ...timestamps,
});

export const paymentRelations = relations(payment, ({ one }) => ({
  user: one(user, {
    fields: [payment.userId],
    references: [user.id],
  }),
}));
