import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { user } from "../primary/user";
import { creditsBatch } from "./credits-batch";
import { creditsCost } from "./credits-cost";

export const creditsUsage = pgTable("credits_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  creditsBatchId: uuid("credits_batch_id")
    .references(() => creditsBatch.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  creditsCostId: uuid("credits_cost_id")
    .references(() => creditsCost.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  ...timestamps,
});

export const creditsUsageRelations = relations(creditsUsage, ({ one }) => ({
  user: one(user, {
    fields: [creditsUsage.userId],
    references: [user.id],
  }),
  creditsBatch: one(creditsBatch, {
    fields: [creditsUsage.creditsBatchId],
    references: [creditsBatch.id],
  }),
  creditsCost: one(creditsCost, {
    fields: [creditsUsage.creditsCostId],
    references: [creditsCost.id],
  }),
}));
