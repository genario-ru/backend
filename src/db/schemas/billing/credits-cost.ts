import { integer, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";

const creditsCostEntity = pgEnum("entity", [
  "idea",
  "ideas-list",
  "scenario-version",
  "scenario-chapter",
  "scenario-scene",
  "scenario-scene-component",
]);

const creditsCostAction = pgEnum("action", ["generate", "regenerate"]);

export const creditsCost = pgTable("credits_cost", {
  id: uuid("id").defaultRandom().primaryKey(),
  entity: creditsCostEntity("entity").notNull(),
  action: creditsCostAction("action").notNull(),
  amount: integer("amount").notNull(),
  ...timestamps,
});
