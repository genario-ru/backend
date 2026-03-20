import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";
import { generationStatus, user } from "@/db/schema";

import { profileChannelToProfilesFromChannelsJob } from "../linking/profile-channel-to-profiles-from-channels-job";
import { profileToProfilesFromChannelsJob } from "../linking/profile-to-profiles-from-channels-job";

export const profilesFromChannelsJob = pgTable("profiles_from_channels_job", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  status: generationStatus("status").notNull(),
  statusDetails: text("status_details"),
  ...timestamps,
});

export const profilesFromChannelsJobRelations = relations(
  profilesFromChannelsJob,
  ({ one, many }) => ({
    user: one(user, {
      fields: [profilesFromChannelsJob.userId],
      references: [user.id],
    }),
    profileToProfilesFromChannelsJob: many(profileToProfilesFromChannelsJob),
    profileChannelToProfilesFromChannelsJob: many(
      profileChannelToProfilesFromChannelsJob,
    ),
  }),
);
