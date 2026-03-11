import { integer, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { generationEntity } from "@/db/constants/generation-entity";
import { timestamps } from "@/db/constants/timestamps";

export const creditsCostAction = pgEnum("credits_cost_action", [
  "generate",
  "regenerate",
]);

export const creditsCost = pgTable("credits_cost", {
  id: uuid("id").defaultRandom().primaryKey(),
  entity: generationEntity("entity").notNull(),
  action: creditsCostAction("action").notNull(),
  amount: integer("amount").notNull(),
  ...timestamps,
});
