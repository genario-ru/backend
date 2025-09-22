import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { scenarioToTone } from "../linking/scenario-to-tone";
import { platform } from "./platform";
import { profile } from "./profile";
import { scenarioVersion } from "./scenario-version";
import { template } from "./template";
import { user } from "./user";
import { videoDuration } from "./video-duration";
import { videoType } from "./video-type";

export const scenario = pgTable("scenario", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  currentVersionId: uuid("current_version_id").references(
    () => scenarioVersion.id,
    {
      onUpdate: "cascade",
      onDelete: "set null",
    },
  ),
  profileId: uuid("profile_id").references(() => profile.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),
  templateId: uuid("template_id").references(() => template.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),
  platformId: uuid("platform_id").references(() => platform.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),
  videoTypeId: uuid("video_type_id").references(() => videoType.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),
  videoDurationId: uuid("video_duration_id").references(
    () => videoDuration.id,
    {
      onUpdate: "cascade",
      onDelete: "set null",
    },
  ),
  name: text("name"),
  description: text("description"),
  targetAudience: text("target_audience"),
  ...timestamps,
});

export const scenarioRelations = relations(scenario, ({ one, many }) => ({
  user: one(user, {
    fields: [scenario.userId],
    references: [user.id],
  }),
  currentVersion: one(scenarioVersion, {
    relationName: "currentVersion",
    fields: [scenario.currentVersionId],
    references: [scenarioVersion.id],
  }),
  profile: one(profile, {
    fields: [scenario.profileId],
    references: [profile.id],
  }),
  template: one(template, {
    fields: [scenario.templateId],
    references: [template.id],
  }),
  platform: one(platform, {
    fields: [scenario.platformId],
    references: [platform.id],
  }),
  videoType: one(videoType, {
    fields: [scenario.videoTypeId],
    references: [videoType.id],
  }),
  videoDuration: one(videoDuration, {
    fields: [scenario.videoDurationId],
    references: [videoDuration.id],
  }),
  versions: many(scenarioVersion, { relationName: "scenarioVersions" }),
  scenarioToTone: many(scenarioToTone),
}));
