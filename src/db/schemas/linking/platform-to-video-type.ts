import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { platform } from "../primary/platform";
import { videoType } from "../primary/video-type";

export const platformToVideoType = pgTable("platform_to_video_type", {
  id: uuid("id").defaultRandom().primaryKey(),
  platformId: uuid("platform_id")
    .references(() => platform.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  videoTypeId: uuid("video_type_id")
    .references(() => videoType.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  ...timestamps,
});

export const platformToVideoTypeRelations = relations(
  platformToVideoType,
  ({ one }) => ({
    platform: one(platform, {
      fields: [platformToVideoType.platformId],
      references: [platform.id],
    }),
    videoType: one(videoType, {
      fields: [platformToVideoType.videoTypeId],
      references: [videoType.id],
    }),
  }),
);
