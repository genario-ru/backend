import { relations } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { profileAttachment } from "./profile-attachment";
import { scenarioScene } from "./scenario-scene";
import { user } from "./user";

export const attachment = pgTable("attachment", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  storageProvider: text("storage_provider").notNull(),
  storageBucket: text("storage_bucket").notNull(),
  storageKey: text("storage_key").notNull(),
  fileName: text("file_name").notNull(),
  fileBytesSize: integer("file_bytes_size").notNull(),
  fileMimeType: text("file_mime_type").notNull(),
  ...timestamps,
});

export const attachmentRelations = relations(attachment, ({ one, many }) => ({
  user: one(user, {
    fields: [attachment.userId],
    references: [user.id],
  }),
  profileAttachments: many(profileAttachment),
  scenarioScenes: many(scenarioScene),
}));
