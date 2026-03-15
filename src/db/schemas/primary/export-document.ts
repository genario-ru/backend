import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { generationStatus } from "@/db/constants/generation-status";
import { timestamps } from "@/db/constants/timestamps";

import { ideasListToExportDocument } from "../linking/ideas-list-to-export-document";
import { scenarioVersionToExportDocument } from "../linking/scenario-version-to-export-document";
import { attachment } from "./attachment";
import { exportDocumentFormat } from "./export-document-format";
import { user } from "./user";

export const exportDocument = pgTable("export_document", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" })
    .notNull(),
  formatId: uuid("format_id")
    .references(() => exportDocumentFormat.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull(),
  attachmentId: uuid("attachment_id").references(() => attachment.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),
  status: generationStatus("status").default("pending").notNull(),
  statusDetails: text("status_details"),
  ...timestamps,
});

export const exportDocumentRelations = relations(
  exportDocument,
  ({ one, many }) => ({
    user: one(user, {
      fields: [exportDocument.userId],
      references: [user.id],
    }),
    format: one(exportDocumentFormat, {
      fields: [exportDocument.formatId],
      references: [exportDocumentFormat.id],
    }),
    attachment: one(attachment, {
      fields: [exportDocument.attachmentId],
      references: [attachment.id],
    }),
    ideasListToExportDocument: many(ideasListToExportDocument),
    scenarioVersionToExportDocument: many(scenarioVersionToExportDocument),
  }),
);
