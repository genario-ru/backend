import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../../constants/timestamps";
import { creditsBatch } from "../billing/credits-batch";
import { creditsPackage } from "../billing/credits-package";
import { subscription } from "../billing/subscription";

export const creditsPackageToCreditsBatch = pgTable(
  "credits_package_to_credits_batch",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creditsPackageId: uuid("credits_package_id")
      .references(() => subscription.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    creditsBatchId: uuid("credits_batch_id")
      .references(() => creditsBatch.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    ...timestamps,
  },
);

export const creditsPackageToCreditsBatchRelations = relations(
  creditsPackageToCreditsBatch,
  ({ one }) => ({
    creditsPackage: one(creditsPackage, {
      fields: [creditsPackageToCreditsBatch.creditsPackageId],
      references: [creditsPackage.id],
    }),
    creditsBatch: one(creditsBatch, {
      fields: [creditsPackageToCreditsBatch.creditsBatchId],
      references: [creditsBatch.id],
    }),
  }),
);
