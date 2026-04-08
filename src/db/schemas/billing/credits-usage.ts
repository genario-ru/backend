import { relations } from "drizzle-orm";
import { integer, pgTable, real, uuid } from "drizzle-orm/pg-core";

import { generationEntity } from "@/db/constants/generation-entity";
import { timestamps } from "@/db/constants/timestamps";

import { user } from "../primary/user";
import { creditsBatch } from "./credits-batch";

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
  entity: generationEntity("entity").notNull(),
  entityId: uuid("entity_id").notNull(),
  creditsAmount: real("credits_amount").notNull(),
  tokensPerCredit: integer("tokens_per_credit").notNull(),
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
