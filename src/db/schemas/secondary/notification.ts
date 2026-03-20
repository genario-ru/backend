import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";
import { user } from "@/db/schema";

export const notification = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  readAt: timestamp("read_at", {
    withTimezone: true,
    mode: "string",
  }),
  ...timestamps,
});

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));
