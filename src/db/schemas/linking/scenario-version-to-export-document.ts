import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { exportDocument } from "../primary/export-document";
import { scenarioVersion } from "../primary/scenario-version";

export const scenarioVersionToExportDocument = pgTable(
  "scenario_version_to_export_document",
  {
    scenarioVersionId: uuid("scenario_version_id")
      .references(() => scenarioVersion.id, {
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
    ...timestamps,
  },
);

export const scenarioVersionToExportDocumentRelations = relations(
  scenarioVersionToExportDocument,
  ({ one }) => ({
    scenarioVersion: one(scenarioVersion, {
      fields: [scenarioVersionToExportDocument.scenarioVersionId],
      references: [scenarioVersion.id],
    }),
    exportDocument: one(exportDocument, {
      fields: [scenarioVersionToExportDocument.exportDocumentId],
      references: [exportDocument.id],
    }),
  }),
);
