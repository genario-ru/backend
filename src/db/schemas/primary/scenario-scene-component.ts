import { relations } from "drizzle-orm";
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { scenarioScene } from "./scenario-scene";
import { scenarioSceneComponentType } from "./scenario-scene-component-type";

export const scenarioSceneComponent = pgTable(
  "scenario_scene_component",
  {
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
  },
  (table) => [
    index("scenario_scene_component_scene_id_created_at_idx").on(
      table.scenarioSceneId,
      table.createdAt,
    ),
    index("scenario_scene_component_type_id_idx").on(table.typeId),
  ],
);

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
