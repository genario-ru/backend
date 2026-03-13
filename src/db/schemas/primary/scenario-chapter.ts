import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { scenarioScene } from "./scenario-scene";
import { scenarioVersion } from "./scenario-version";

export const scenarioChapterStatus = pgEnum("scenario_chapter_status", [
  "pending",
  "generation",
  "failed",
  "ready",
]);

export const scenarioChapter = pgTable("scenario_chapter", {
  id: uuid("id").defaultRandom().primaryKey(),
  scenarioVersionId: uuid("scenario_version_id")
    .references(() => scenarioVersion.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: scenarioChapterStatus("status").default("pending").notNull(),
  startTime: integer("start_time").notNull(),
  endTime: integer("end_time").notNull(),
  ...timestamps,
});

export const scenarioChapterRelations = relations(
  scenarioChapter,
  ({ one, many }) => ({
    scenarioVersion: one(scenarioVersion, {
      fields: [scenarioChapter.scenarioVersionId],
      references: [scenarioVersion.id],
    }),
    scenes: many(scenarioScene),
  }),
);
