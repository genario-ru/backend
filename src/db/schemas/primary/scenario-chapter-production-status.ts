import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { scenarioChapter } from "./scenario-chapter";

export const scenarioChapterProductionStatus = pgTable(
  "scenario_chapter_production_status",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").unique().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    color: text("color"),
    ...timestamps,
  },
);

export const scenarioChapterProductionStatusRelations = relations(
  scenarioChapterProductionStatus,
  ({ many }) => ({
    scenarioChapter: many(scenarioChapter),
  }),
);
