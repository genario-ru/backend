import { integer, pgTable, real, text, uuid } from "drizzle-orm/pg-core";

import { generationEntity } from "@/db/constants/generation-entity";
import { timestamps } from "@/db/constants/timestamps";

export const generationLog = pgTable("generation_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  entity: generationEntity("entity").notNull(),
  entityId: uuid("entity_id").notNull(),
  prompt: text("prompt"),
  model: text("model").notNull(),
  tokens: integer("tokens").notNull(),
  cost: real("cost"),
  ...timestamps,
});
