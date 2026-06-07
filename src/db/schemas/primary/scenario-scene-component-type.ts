import { relations } from "drizzle-orm";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { uniqueSlug } from "@/db/constants/slug";
import { timestamps } from "@/db/constants/timestamps";

import { scenarioSceneComponent } from "./scenario-scene-component";

export const scenarioSceneComponentType = pgTable(
  "scenario_scene_component_type",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    details: text("details"),
    icon: text("icon"),
    color: text("color"),
    optional: boolean("optional").notNull().default(false),
    ...uniqueSlug(),
    ...timestamps,
  },
);

export const scenarioSceneComponentTypeRelations = relations(
  scenarioSceneComponentType,
  ({ many }) => ({
    scenarioSceneComponent: many(scenarioSceneComponent),
  }),
);
