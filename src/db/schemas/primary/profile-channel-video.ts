import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

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
  internalId: text("internal_id").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  name: text("name").notNull(),
  description: text("description"),
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
