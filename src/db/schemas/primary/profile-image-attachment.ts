import { relations } from "drizzle-orm";
import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { attachment } from "./attachment";
import { profile } from "./profile";

export const profileImageAttachmentType = pgEnum(
  "profile_image_attachment_type",
  ["actor-reference", "thumbnail-reference"],
);

export const profileImageAttachment = pgTable("profile_image_attachment", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: profileImageAttachmentType("type").notNull(),
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

export const profileImageAttachmentRelations = relations(
  profileImageAttachment,
  ({ one }) => ({
    profile: one(profile, {
      fields: [profileImageAttachment.profileId],
      references: [profile.id],
    }),
    attachment: one(attachment, {
      fields: [profileImageAttachment.attachmentId],
      references: [attachment.id],
    }),
  }),
);
