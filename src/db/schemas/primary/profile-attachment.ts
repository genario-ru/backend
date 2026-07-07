import { relations } from "drizzle-orm";
import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { attachment } from "./attachment";
import { profile } from "./profile";

export const profileAttachmentType = pgEnum("profile_attachment_type", [
  "actor-reference",
  "thumbnail-reference",
  "video-reference",
]);

export const profileAttachment = pgTable("profile_attachment", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: profileAttachmentType("type").notNull(),
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
