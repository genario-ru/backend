import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { scenarioChapter } from "./scenario-chapter";

export const productionStatus = pgTable("production_status", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  isDefault: boolean("is_default").notNull().default(false),
  forScenario: boolean("for_scenario").notNull().default(false),
  forScenarioChapter: boolean("for_scenario_chapter").notNull().default(false),
  priority: integer("priority").notNull().default(0),
  ...timestamps,
});

export const productionStatusRelations = relations(
  productionStatus,
  ({ many }) => ({
    scenarioChapter: many(scenarioChapter),
  }),
);
