import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";
import { profileChannel } from "@/db/schema";

import { profilesFromChannelsJob } from "../jobs/profiles-from-channels-job";

export const profileChannelToProfilesFromChannelsJob = pgTable(
  "profile_channel_to_profiles_from_channels_job",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileChannelId: uuid("profile_channel_id")
      .references(() => profileChannel.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    profilesFromChannelsJobId: uuid("profiles_from_channels_job_id")
      .references(() => profilesFromChannelsJob.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    ...timestamps,
  },
);

export const profileChannelToProfilesFromChannelsJobRelations = relations(
  profileChannelToProfilesFromChannelsJob,
  ({ one }) => ({
    profileChannel: one(profileChannel, {
      fields: [profileChannelToProfilesFromChannelsJob.profileChannelId],
      references: [profileChannel.id],
    }),
    profilesFromChannelsJob: one(profilesFromChannelsJob, {
      fields: [
        profileChannelToProfilesFromChannelsJob.profilesFromChannelsJobId,
      ],
      references: [profilesFromChannelsJob.id],
    }),
  }),
);
