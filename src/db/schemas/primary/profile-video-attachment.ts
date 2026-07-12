import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { attachment } from "./attachment";
import { profile } from "./profile";

export const profileVideoAttachment = pgTable("profile_video_attachment", {
  id: uuid("id").defaultRandom().primaryKey(),
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
  summary: text("summary"),
  mainTopics: text("main_topics").array(),
  keyPoints: text("key_points").array(),
  tone: text("tone"),
  targetAudience: text("target_audience"),
  quotes: text("quotes").array(),
  timeline: text("timeline"),
  wordCount: integer("word_count"),
  segments: integer("segments"),
  transcript: text("transcript"),
  transcriptSegments: jsonb("transcript_segments").array(),
  ...timestamps,
});

export const profileVideoAttachmentRelations = relations(
  profileVideoAttachment,
  ({ one }) => ({
    profile: one(profile, {
      fields: [profileVideoAttachment.profileId],
      references: [profile.id],
    }),
    attachment: one(attachment, {
      fields: [profileVideoAttachment.attachmentId],
      references: [attachment.id],
    }),
  }),
);
