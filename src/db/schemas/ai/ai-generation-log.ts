import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";

export const aiGenerationLogType = pgEnum("ai_generation_log_entity_type", [
  "ideas-list",
  "scenario-version",
  "scenario-version-chapter",
  "scenario-scene-preview",
]);

export const aiGenerationLog = pgTable("ai_generation_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: aiGenerationLogType("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  prompt: text("prompt"),
  model: text("model").notNull(),
  tokens: integer("tokens").notNull(),
  cost: decimal("cost"),
  ...timestamps,
});
