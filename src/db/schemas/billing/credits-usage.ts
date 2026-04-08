import { relations } from "drizzle-orm";
import { pgEnum, pgTable, real, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { user } from "../primary/user";
import { creditsBatch } from "./credits-batch";

export const creditsUsageEntity = pgEnum("credits_usage_entity", [
  "ideas-list",
  "scenario",
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
  entity: creditsUsageEntity("entity").notNull(),
  entityId: uuid("entity_id").notNull(),
  creditsAmount: real("credits_amount").notNull(),
  creditPrice: real("credit_price").notNull(),
  totalPrice: real("total_price").notNull(),
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
