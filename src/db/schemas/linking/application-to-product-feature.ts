import { relations } from "drizzle-orm";
import { index, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { application } from "../primary/application";
import { productFeature } from "../primary/product-feature";

export const applicationToProductFeature = pgTable(
  "application_to_product_feature",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .references(() => application.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    productFeatureId: uuid("product_feature_id")
      .references(() => productFeature.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("application_to_product_feature_unique_idx").on(
      table.applicationId,
      table.productFeatureId,
    ),
    index("application_to_product_feature_application_id_idx").on(
      table.applicationId,
    ),
    index("application_to_product_feature_product_feature_id_idx").on(
      table.productFeatureId,
    ),
  ],
);

export const applicationToProductFeatureRelations = relations(
  applicationToProductFeature,
  ({ one }) => ({
    application: one(application, {
      fields: [applicationToProductFeature.applicationId],
      references: [application.id],
    }),
    productFeature: one(productFeature, {
      fields: [applicationToProductFeature.productFeatureId],
      references: [productFeature.id],
    }),
  }),
);
