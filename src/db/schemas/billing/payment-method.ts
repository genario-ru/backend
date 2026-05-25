import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { user } from "../primary/user";
import { payment } from "./payment";

export const paymentMethodStatus = pgEnum("payment_method_status", [
  "pending",
  "active",
  "inactive",
]);

export const paymentMethod = pgTable(
  "payment_method",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
      .notNull(),
    paymentMethodId: text("payment_method_id").notNull(),
    status: paymentMethodStatus("status").notNull(),
    statusDetails: text("status_details"),
    type: text("type").notNull(),
    title: text("title"),
    confirmationUrl: text("confirmation_url"),
    data: jsonb("data"),
    default: boolean("default").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("payment_method_payment_method_id_idx").on(table.paymentMethodId),
    index("payment_method_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("payment_method_user_id_status_created_at_idx").on(
      table.userId,
      table.status,
      table.createdAt,
    ),
  ],
);

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
