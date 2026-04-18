import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { user } from "../primary/user";

export const emailLogStatus = pgEnum("email_log_status", [
  "pending",
  "sent",
  "failed",
]);

export const emailTemplateKey = pgEnum("email_template_key", [
  "otp",
  "email_verification",
]);

export const emailLog = pgTable("email_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => user.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),
  to: text("to").notNull(),
  from: text("from").notNull(),
  subject: text("subject").notNull(),
  templateKey: emailTemplateKey("template_key").notNull(),
  status: emailLogStatus("status").notNull().default("pending"),
  messageId: text("message_id"),
  error: text("error"),
  attempts: integer("attempts").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true, mode: "string" }),
  ...timestamps,
});

export const emailLogRelations = relations(emailLog, ({ one }) => ({
  user: one(user, {
    fields: [emailLog.userId],
    references: [user.id],
  }),
}));
