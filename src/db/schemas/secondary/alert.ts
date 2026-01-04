import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";

export const alertType = pgEnum("alert_type", [
  "info",
  "warning",
  "negative",
  "positive",
]);

export const alert = pgTable("alert", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: alertType("type").default("info").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  ...timestamps,
});
