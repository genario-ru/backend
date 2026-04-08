import {
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

export const generationLogEntity = pgEnum("generation_log_entity", [
  "ideas-list",
  "scenario-chapters",
  "scenario-chapter-scenes",
  "scenario-scene-preview",
]);

export const generationLog = pgTable("generation_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  entity: generationLogEntity("entity").notNull(),
  entityId: uuid("entity_id").notNull(),
  prompt: text("prompt"),
  model: text("model").notNull(),
  tokens: integer("tokens").notNull(),
  cost: real("cost"),
  ...timestamps,
});
