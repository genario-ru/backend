import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { scenario } from "../primary/scenario";
import { tone } from "../primary/tone";

export const scenarioToTone = pgTable("scenario_to_tone", {
  id: uuid("id").defaultRandom().primaryKey(),
  scenarioId: uuid("scenario_id")
    .references(() => scenario.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  toneId: uuid("tone_id")
    .references(() => tone.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  ...timestamps,
});

export const scenarioToToneRelations = relations(scenarioToTone, ({ one }) => ({
  scenario: one(scenario, {
    fields: [scenarioToTone.scenarioId],
    references: [scenario.id],
  }),
  tone: one(tone, {
    fields: [scenarioToTone.toneId],
    references: [tone.id],
  }),
}));
