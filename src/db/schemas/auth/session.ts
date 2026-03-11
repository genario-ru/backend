import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { user } from "../primary/user";

export const session = pgTable("session", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(), // IPv6 может быть до 45 символов
  userAgent: text("user_agent").notNull(),
  impersonatedBy: uuid("impersonated_by").references(() => user.id, {
    onUpdate: "cascade",
  }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  ...timestamps,
});

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
    relationName: "session",
  }),
  impersonatedBy: one(user, {
    fields: [session.impersonatedBy],
    references: [user.id],
    relationName: "impersonatedSession",
  }),
}));
