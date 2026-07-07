import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { profileChannelToProfilesFromChannelsJob } from "../linking/profile-channel-to-profiles-from-channels-job";
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
  platformId: uuid("platform_id")
    .references(() => platform.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  externalId: text("external_id"),
  url: text("url").notNull(),
  avatarUrl: text("avatar_url"),
  slug: text("slug"),
  name: text("name"),
  description: text("description"),
  verified: boolean("verified"),
  followers: integer("followers"),
  following: integer("following"),
  totalPosts: integer("total_posts"),
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
    profileChannelToProfilesFromChannelsJob: many(
      profileChannelToProfilesFromChannelsJob,
    ),
  }),
);
