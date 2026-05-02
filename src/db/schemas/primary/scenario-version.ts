import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";
import { generationStatus } from "@/db/schema";

import { scenarioVersionToExportDocument } from "../linking/scenario-version-to-export-document";
import { scenario } from "./scenario";
import { scenarioChapter } from "./scenario-chapter";
import { scenarioVideoReference } from "./scenario-video-reference";

export const scenarioVersion = pgTable("scenario_version", {
  id: uuid("id").defaultRandom().primaryKey(),
  scenarioId: uuid("scenario_id")
    .references(() => scenario.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  status: generationStatus("status").default("pending").notNull(),
  ...timestamps,
});

export const scenarioVersionRelations = relations(
  scenarioVersion,
  ({ one, many }) => ({
    scenario: one(scenario, {
      fields: [scenarioVersion.scenarioId],
      references: [scenario.id],
    }),
    chapters: many(scenarioChapter),
    videoReferences: many(scenarioVideoReference),
    scenarioVersionToExportDocument: many(scenarioVersionToExportDocument),
  }),
);
