import { relations } from "drizzle-orm";
import { decimal, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { user } from "../primary/user";
import { creditsBatch } from "./credits-batch";

export const creditsUsageEntity = pgEnum("credits_usage_entity", [
  "ideas-list",
  "scenario-version",
  "scenario-version-chapter",
  "scenario-scene-preview",
]);

export const creditsUsage = pgTable("credits_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  batchId: uuid("credits_batch_id")
    .references(() => creditsBatch.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  entityId: uuid("entity_id"),
  entity: creditsUsageEntity("entity").notNull(),
  amount: decimal("amount").notNull(),
  ...timestamps,
});

export const creditsUsageRelations = relations(creditsUsage, ({ one }) => ({
  user: one(user, {
    fields: [creditsUsage.userId],
    references: [user.id],
  }),
  batch: one(creditsBatch, {
    fields: [creditsUsage.batchId],
    references: [creditsBatch.id],
  }),
}));
