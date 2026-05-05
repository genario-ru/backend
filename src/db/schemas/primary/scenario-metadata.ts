import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { generationStatus } from "@/db/constants/generation-status";
import { timestamps } from "@/db/constants/timestamps";

import { platform } from "./platform";
import { scenario } from "./scenario";

export const scenarioMetadata = pgTable("scenario_metadata", {
  id: uuid("id").defaultRandom().primaryKey(),
  scenarioId: uuid("scenario_id")
    .references(() => scenario.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  platformId: uuid("platform_id")
    .references(() => platform.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  status: generationStatus("status").default("idle").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  tags: text("tags").notNull(),
  ...timestamps,
});

export const scenarioMetadataRelations = relations(
  scenarioMetadata,
  ({ one }) => ({
    scenario: one(scenario, {
      fields: [scenarioMetadata.scenarioId],
      references: [scenario.id],
    }),
    platform: one(platform, {
      fields: [scenarioMetadata.platformId],
      references: [platform.id],
    }),
  }),
);
