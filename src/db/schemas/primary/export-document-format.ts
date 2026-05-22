import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { uniqueSlug } from "@/db/constants/slug";
import { timestamps } from "@/db/constants/timestamps";

import { exportDocument } from "./export-document";

export const exportDocumentFormat = pgTable("export_document_format", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  icon: text("icon"),
  ...uniqueSlug,
  ...timestamps,
});

export const exportDocumentFormatRelations = relations(
  exportDocumentFormat,
  ({ many }) => ({
    exportDocuments: many(exportDocument),
  }),
);
