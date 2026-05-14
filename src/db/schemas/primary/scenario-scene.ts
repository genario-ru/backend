import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { scenarioChapter } from "./scenario-chapter";
import { scenarioSceneComponent } from "./scenario-scene-component";
import { scenarioScenePreview } from "./scenario-scene-preview";

export const scenarioScene = pgTable(
  "scenario_scene",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scenarioChapterId: uuid("scenario_chapter_id")
      .references(() => scenarioChapter.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    name: text("name").notNull(),
    startTime: integer("start_time").notNull(),
    endTime: integer("end_time").notNull(),
    ...timestamps,
  },
  (table) => [
    index("scenario_scene_chapter_id_start_time_idx").on(
      table.scenarioChapterId,
      table.startTime,
    ),
  ],
);

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
