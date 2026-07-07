import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { profileChannel } from "./profile-channel";

export const profileChannelVideo = pgTable("profile_channel_video", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileChannelId: uuid("profile_channel_id")
    .references(() => profileChannel.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  externalId: text("external_id"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  name: text("name"),
  description: text("description"),
  likes: integer("likes"),
  views: integer("views"),
  comments: integer("comments"),
  duration: text("duration"),
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

export const profileChannelVideoRelations = relations(
  profileChannelVideo,
  ({ one }) => ({
    profileChannel: one(profileChannel, {
      fields: [profileChannelVideo.profileChannelId],
      references: [profileChannel.id],
    }),
  }),
);
