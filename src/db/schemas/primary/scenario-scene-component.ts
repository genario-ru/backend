import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { scenarioScene } from "./scenario-scene";

export const scenarioSceneComponent = pgTable("scenario_scene_component", {
  id: uuid("id").defaultRandom().primaryKey(),
  scenarioSceneId: uuid("scenario_scene_id")
    .references(() => scenarioScene.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  name: text("name").notNull(),
  content: text("content"),
  icon: text("icon"),
  color: text("color"),
  ...timestamps,
});

export const scenarioSceneComponentRelations = relations(
  scenarioSceneComponent,
  ({ one }) => ({
    scenarioScene: one(scenarioScene, {
      fields: [scenarioSceneComponent.scenarioSceneId],
      references: [scenarioScene.id],
    }),
  }),
);
