import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { attachment } from "./attachment";
import { profile } from "./profile";

export const profileAttachment = pgTable("profile_attachment", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  profileId: uuid("profile_id")
    .references(() => profile.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  attachmentId: uuid("attachment_id")
    .references(() => attachment.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  ...timestamps,
});

export const profileAttachmentRelations = relations(
  profileAttachment,
  ({ one }) => ({
    profile: one(profile, {
      fields: [profileAttachment.profileId],
      references: [profile.id],
    }),
    attachment: one(attachment, {
      fields: [profileAttachment.attachmentId],
      references: [attachment.id],
    }),
  }),
);
