import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

export const alertType = pgEnum("alert_type", [
  "info",
  "warning",
  "negative",
  "positive",
]);

export const alertStatus = pgEnum("alert_status", ["active", "inactive"]);

export const alert = pgTable(
  "alert",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    type: alertType("type").default("info").notNull(),
    status: alertStatus("status").default("active").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("alert_status_expires_at_created_at_idx").on(
      table.status,
      table.expiresAt,
      table.createdAt,
    ),
  ],
);
