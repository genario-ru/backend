import { relations } from "drizzle-orm";
import { boolean, index, pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { exportDocument } from "../primary/export-document";
import { ideasList } from "../primary/ideas-list";

export const ideasListToExportDocument = pgTable(
  "ideas_list_to_export_document",
  {
    ideasListId: uuid("ideas_list_id")
      .references(() => ideasList.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    exportDocumentId: uuid("export_document_id")
      .references(() => exportDocument.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    savedOnly: boolean("saved_only").default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    index("ideas_list_to_export_document_list_saved_created_idx").on(
      table.ideasListId,
      table.savedOnly,
      table.createdAt,
    ),
    index("ideas_list_to_export_document_list_export_idx").on(
      table.ideasListId,
      table.exportDocumentId,
    ),
  ],
);

export const ideasListToExportDocumentRelations = relations(
  ideasListToExportDocument,
  ({ one }) => ({
    ideasList: one(ideasList, {
      fields: [ideasListToExportDocument.ideasListId],
      references: [ideasList.id],
    }),
    exportDocument: one(exportDocument, {
      fields: [ideasListToExportDocument.exportDocumentId],
      references: [exportDocument.id],
    }),
  }),
);
