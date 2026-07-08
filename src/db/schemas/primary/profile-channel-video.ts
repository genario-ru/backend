import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { platform } from "./platform";
import { profile } from "./profile";
import { profileChannel } from "./profile-channel";

export const profileChannelVideo = pgTable("profile_channel_video", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .references(() => profile.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  platformId: uuid("platform_id")
    .references(() => platform.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  profileChannelId: uuid("profile_channel_id").references(
    () => profileChannel.id,
    {
      onDelete: "set null",
      onUpdate: "cascade",
    },
  ),
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
    profile: one(profile, {
      fields: [profileChannelVideo.profileId],
      references: [profile.id],
    }),
    platform: one(platform, {
      fields: [profileChannelVideo.platformId],
      references: [platform.id],
    }),
    profileChannel: one(profileChannel, {
      fields: [profileChannelVideo.profileChannelId],
      references: [profileChannel.id],
    }),
  }),
);
