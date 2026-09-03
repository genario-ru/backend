import { relations } from "drizzle-orm";
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { profileToPlatform } from "../linking/profile-to-platform";
import { profileToProfilesFromChannelsJob } from "../linking/profile-to-profiles-from-channels-job";
import { profileToTone } from "../linking/profile-to-tone";
import { ideasList } from "./ideas-list";
import { profileChannel } from "./profile-channel";
import { profileChannelVideo } from "./profile-channel-video";
import { profileImageAttachment } from "./profile-image-attachment";
import { profileType } from "./profile-type";
import { profileVideoAttachment } from "./profile-video-attachment";
import { scenario } from "./scenario";
import { user } from "./user";

export const profile = pgTable(
  "profile",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
      .notNull(),
    typeId: uuid("type_id").references(() => profileType.id, {
      onUpdate: "cascade",
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    positioning: text("positioning"),
    targetAudience: text("target_audience"),
    additionalInfo: text("additional_info"),
    ...timestamps,
  },
  (table) => [
    index("profile_user_id_created_at_idx").on(table.userId, table.createdAt),
    index("profile_type_id_idx").on(table.typeId),
  ],
);

export const profileRelations = relations(profile, ({ one, many }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
  type: one(profileType, {
    fields: [profile.typeId],
    references: [profileType.id],
  }),
  channels: many(profileChannel),
  channelVideos: many(profileChannelVideo),
  imageAttachments: many(profileImageAttachment),
  videoAttachments: many(profileVideoAttachment),
  ideasLists: many(ideasList),
  scenarios: many(scenario),
  profileToPlatform: many(profileToPlatform),
  profileToTone: many(profileToTone),
  profileToProfilesFromChannelsJob: many(profileToProfilesFromChannelsJob),
}));
