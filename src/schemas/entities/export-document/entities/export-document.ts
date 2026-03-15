import { createSelectSchema } from "drizzle-zod";

import { exportDocument } from "@/db/schema";
import { z } from "@/lib/zod";
import { generationStatusSchema } from "@/schemas/common/generation-status";

import { attachmentSchema } from "../../attachments/entities/attachment";
import { exportDocumentFormatSchema } from "./export-document-format";

export const exportDocumentSchema = createSelectSchema(exportDocument).meta({
  title: "Export document",
  description: "Export document description",
  ref: "ExportDocumentSchema",
});

export type ExportDocument = z.infer<typeof exportDocumentSchema>;

export const exportDocumentShortSchema = z
  .object({
    formatName: z.string(),
    formatSlug: z.string(),
    formatColor: z.string().nullable(),
    formatIcon: z.string().nullable(),
    documentStatus: generationStatusSchema,
    documentStatusDetails: z.string().nullable(),
    documentUrl: z.string().nullable(),
  })
  .meta({
    title: "Export document short",
    description: "Export document short description",
    ref: "ExportDocumentShortSchema",
  });

export type ExportDocumentShort = z.infer<typeof exportDocumentShortSchema>;

export const exportDocumentExtendedSchema = exportDocumentSchema
  .extend({
    format: exportDocumentFormatSchema,
    attachment: attachmentSchema,
  })
  .meta({
    title: "Export document extended",
    description: "Export document extended description",
    ref: "ExportDocumentExtendedSchema",
  });

export type ExportDocumentExtended = z.infer<
  typeof exportDocumentExtendedSchema
>;
