import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { profilesFromChannelsJob } from "../jobs/profiles-from-channels-job";
import { profile } from "../primary/profile";

export const profileToProfilesFromChannelsJob = pgTable(
  "profile_to_profiles_from_channels_job",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .references(() => profile.id, {
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

export const profileToProfilesFromChannelsJobRelations = relations(
  profileToProfilesFromChannelsJob,
  ({ one }) => ({
    profile: one(profile, {
      fields: [profileToProfilesFromChannelsJob.profileId],
      references: [profile.id],
    }),
    profilesFromChannelsJob: one(profilesFromChannelsJob, {
      fields: [profileToProfilesFromChannelsJob.profilesFromChannelsJobId],
      references: [profilesFromChannelsJob.id],
    }),
  }),
);
