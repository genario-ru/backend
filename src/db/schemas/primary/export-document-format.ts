import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { exportDocument } from "./export-document";

export const exportDocumentFormat = pgTable("export_document_format", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  icon: text("icon"),
  ...timestamps,
});

export const exportDocumentFormatRelations = relations(
  exportDocumentFormat,
  ({ many }) => ({
    exportDocuments: many(exportDocument),
  }),
);
