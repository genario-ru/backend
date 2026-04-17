import { relations } from "drizzle-orm";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { scenarioToPlatform } from "../linking/scenario-to-platform";
import { scenarioToTone } from "../linking/scenario-to-tone";
import { productionStatus } from "./production-status";
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
  profileId: uuid("profile_id").references(() => profile.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),
  templateId: uuid("template_id").references(() => template.id, {
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
  productionStatusId: uuid("production_status_id").references(
    () => productionStatus.id,
    {
      onUpdate: "cascade",
      onDelete: "set null",
    },
  ),
  saved: boolean("saved").notNull().default(false),
  name: text("name").notNull(),
  description: text("description").notNull(),
  targetAudience: text("target_audience"),
  ...timestamps,
});

export const scenarioRelations = relations(scenario, ({ one, many }) => ({
  user: one(user, {
    fields: [scenario.userId],
    references: [user.id],
  }),
  profile: one(profile, {
    fields: [scenario.profileId],
    references: [profile.id],
  }),
  template: one(template, {
    fields: [scenario.templateId],
    references: [template.id],
  }),
  videoType: one(videoType, {
    fields: [scenario.videoTypeId],
    references: [videoType.id],
  }),
  videoDuration: one(videoDuration, {
    fields: [scenario.videoDurationId],
    references: [videoDuration.id],
  }),
  productionStatus: one(productionStatus, {
    fields: [scenario.productionStatusId],
    references: [productionStatus.id],
  }),
  versions: many(scenarioVersion),
  scenarioToTone: many(scenarioToTone),
  scenarioToPlatform: many(scenarioToPlatform),
}));
