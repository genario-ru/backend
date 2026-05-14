import { relations } from "drizzle-orm";
import { index, pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { platform } from "../primary/platform";
import { scenario } from "../primary/scenario";

export const scenarioToPlatform = pgTable(
  "scenario_to_platform",
  {
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
    ...timestamps,
  },
  (table) => [
    index("scenario_to_platform_scenario_id_idx").on(table.scenarioId),
    index("scenario_to_platform_platform_id_scenario_id_idx").on(
      table.platformId,
      table.scenarioId,
    ),
  ],
);

export const scenarioToPlatformRelations = relations(
  scenarioToPlatform,
  ({ one }) => ({
    scenario: one(scenario, {
      fields: [scenarioToPlatform.scenarioId],
      references: [scenario.id],
    }),
    platform: one(platform, {
      fields: [scenarioToPlatform.platformId],
      references: [platform.id],
    }),
  }),
);
