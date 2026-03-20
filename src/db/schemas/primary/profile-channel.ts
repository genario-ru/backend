import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { profileToProfilesFromChannelsJob } from "../linking/profile-to-profiles-from-channels-job";
import { platform } from "./platform";
import { profile } from "./profile";
import { profileChannelVideo } from "./profile-channel-video";

export const profileChannel = pgTable("profile_channel", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .references(() => profile.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  internalId: text("internal_id").notNull(),
  slug: text("slug"),
  url: text("url").notNull(),
  avatarUrl: text("avatar_url"),
  name: text("name").notNull(),
  description: text("description"),
  platformId: uuid("platform_id")
    .references(() => platform.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  ...timestamps,
});

export const profileChannelRelations = relations(
  profileChannel,
  ({ one, many }) => ({
    profile: one(profile, {
      fields: [profileChannel.profileId],
      references: [profile.id],
    }),
    platform: one(platform, {
      fields: [profileChannel.platformId],
      references: [platform.id],
    }),
    videos: many(profileChannelVideo),
    profilesFromChannelsJob: many(profileToProfilesFromChannelsJob),
  }),
);
