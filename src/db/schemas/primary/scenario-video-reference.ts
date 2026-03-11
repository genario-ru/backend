import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { platform } from "./platform";
import { scenarioVersion } from "./scenario-version";

export const scenarioVideoReference = pgTable("scenario_video_reference", {
  id: uuid("id").defaultRandom().primaryKey(),
  scenarioVersionId: uuid("scenario_version_id")
    .references(() => scenarioVersion.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  platformId: uuid("platform_id")
    .references(() => platform.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  name: text("name").notNull(),
  description: text("description"),
  ...timestamps,
});

export const scenarioVideoReferenceRelations = relations(
  scenarioVideoReference,
  ({ one }) => ({
    scenarioVersion: one(scenarioVersion, {
      fields: [scenarioVideoReference.scenarioVersionId],
      references: [scenarioVersion.id],
    }),
    platform: one(platform, {
      fields: [scenarioVideoReference.platformId],
      references: [platform.id],
    }),
  }),
);
