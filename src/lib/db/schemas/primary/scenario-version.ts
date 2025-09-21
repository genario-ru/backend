import { relations } from "drizzle-orm";
import { pgEnum, pgTable, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { scenario } from "./scenario";
import { scenarioChapter } from "./scenario-chapter";
import { scenarioVideoReference } from "./scenario-video-reference";

export const scenarioVersionStatus = pgEnum("scenario_version_status", [
  "pending",
  "generation",
  "failed",
  "ready",
]);

export const scenarioVersion = pgTable("scenario_version", {
  id: uuid("id").defaultRandom().primaryKey(),
  // TODO: Проблема с наследованием типов TypeScript при кросс-референсах. Убрать 'AnyPgColumn', если пофиксится в будущем
  // https://github.com/drizzle-team/drizzle-orm/issues/2476
  // https://github.com/drizzle-team/drizzle-orm/issues/435
  scenarioId: uuid("scenario_id")
    .references((): AnyPgColumn => scenario.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  status: scenarioVersionStatus("status").default("pending").notNull(),
  ...timestamps,
});

export const scenarioVersionRelations = relations(
  scenarioVersion,
  ({ one, many }) => ({
    scenario: one(scenario, {
      relationName: "scenarioVersions",
      fields: [scenarioVersion.scenarioId],
      references: [scenario.id],
    }),
    chapters: many(scenarioChapter),
    videoReferences: many(scenarioVideoReference),
  }),
);
