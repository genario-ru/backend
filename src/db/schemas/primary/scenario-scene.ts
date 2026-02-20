import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { scenarioChapter } from "./scenario-chapter";
import { scenarioSceneComponent } from "./scenario-scene-component";
import { scenarioScenePreview } from "./scenario-scene-preview";

export const scenarioSceneStatus = pgEnum("scenario_scene_status", [
  "pending",
  "generation",
  "failed",
  "ready",
]);

export const scenarioScene = pgTable("scenario_scene", {
  id: uuid("id").defaultRandom().primaryKey(),
  scenarioChapterId: uuid("scenario_chapter_id")
    .references(() => scenarioChapter.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  status: scenarioSceneStatus("status").default("pending").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  startTime: integer("start_time").notNull(),
  endTime: integer("end_time").notNull(),
  badges: text("badges"), // Строки с названиями бейджиков через запятую
  ...timestamps,
});

export const scenarioSceneRelations = relations(
  scenarioScene,
  ({ one, many }) => ({
    scenarioChapter: one(scenarioChapter, {
      fields: [scenarioScene.scenarioChapterId],
      references: [scenarioChapter.id],
    }),
    preview: one(scenarioScenePreview),
    components: many(scenarioSceneComponent),
  }),
);
