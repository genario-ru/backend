import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { scenario } from "../primary/scenario";
import { scenarioVersion } from "../primary/scenario-version";

export const scenarioToScenarioVersion = pgTable(
  "scenario_to_scenario_version",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scenarioId: uuid("scenario_id")
      .references(() => scenario.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    scenarioVersionId: uuid("scenario_version_id")
      .references(() => scenarioVersion.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    ...timestamps,
  },
);

export const scenarioToScenarioVersionRelations = relations(
  scenarioToScenarioVersion,
  ({ one }) => ({
    scenario: one(scenario, {
      fields: [scenarioToScenarioVersion.scenarioId],
      references: [scenario.id],
    }),
    scenarioVersion: one(scenarioVersion, {
      fields: [scenarioToScenarioVersion.scenarioVersionId],
      references: [scenarioVersion.id],
    }),
  }),
);
