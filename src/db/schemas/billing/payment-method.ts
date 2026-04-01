import { relations } from "drizzle-orm";
import { jsonb, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { user } from "../primary/user";
import { payment } from "./payment";

export const paymentMethodStatus = pgEnum("payment_method_status", [
  "pending",
  "active",
]);

export const paymentMethod = pgTable("payment_method", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  paymentMethodId: text("payment_method_id").notNull(),
  status: paymentMethodStatus("status").notNull(),
  type: text("type").notNull(),
  title: text("title"),
  confirmationUrl: text("confirmation_url"),
  data: jsonb("data"),
  ...timestamps,
});

export const paymentMethodRelations = relations(
  paymentMethod,
  ({ one, many }) => ({
    user: one(user, {
      fields: [paymentMethod.userId],
      references: [user.id],
    }),
    payments: many(payment),
  }),
);
