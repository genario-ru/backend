import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { scenarioScene } from "./scenario-scene";
import { scenarioSceneComponentType } from "./scenario-scene-component-type";

export const scenarioSceneComponent = pgTable("scenario_scene_component", {
  id: uuid("id").defaultRandom().primaryKey(),
  typeId: uuid("type_id")
    .references(() => scenarioSceneComponentType.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  scenarioSceneId: uuid("scenario_scene_id")
    .references(() => scenarioScene.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  name: text("name").notNull(),
  content: text("content"),
  ...timestamps,
});

export const scenarioSceneComponentRelations = relations(
  scenarioSceneComponent,
  ({ one }) => ({
    type: one(scenarioSceneComponentType, {
      fields: [scenarioSceneComponent.typeId],
      references: [scenarioSceneComponentType.id],
    }),
    scenarioScene: one(scenarioScene, {
      fields: [scenarioSceneComponent.scenarioSceneId],
      references: [scenarioScene.id],
    }),
  }),
);
