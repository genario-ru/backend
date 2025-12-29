import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";

export const creditsPackage = pgTable("credits_package", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  }),
  ...timestamps,
});
