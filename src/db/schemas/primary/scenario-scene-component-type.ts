import { relations } from "drizzle-orm";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { scenarioSceneComponent } from "./scenario-scene-component";

export const scenarioSceneComponentType = pgTable(
  "scenario_scene_component_type",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    color: text("color"),
    optional: boolean("optional").notNull().default(false),
    ...timestamps,
  },
);

export const scenarioSceneComponentTypeRelations = relations(
  scenarioSceneComponentType,
  ({ many }) => ({
    scenarioSceneComponent: many(scenarioSceneComponent),
  }),
);
