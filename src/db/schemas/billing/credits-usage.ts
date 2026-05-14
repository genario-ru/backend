import { relations } from "drizzle-orm";
import { index, integer, pgTable, real, uuid } from "drizzle-orm/pg-core";

import { generationEntity } from "@/db/constants/generation-entity";
import { timestamps } from "@/db/constants/timestamps";

import { user } from "../primary/user";
import { creditsBatch } from "./credits-batch";

export const creditsUsage = pgTable(
  "credits_usage",
  {
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
  },
  (table) => [
    index("credits_usage_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("credits_usage_batch_id_idx").on(table.batchId),
  ],
);

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
