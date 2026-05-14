import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("verification_identifier_value_idx").on(
      table.identifier,
      table.value,
    ),
    index("verification_expires_at_idx").on(table.expiresAt),
  ],
);
