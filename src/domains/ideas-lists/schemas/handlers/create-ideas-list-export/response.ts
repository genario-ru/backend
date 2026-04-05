import { exportDocumentShortSchema } from "@/domains/export-document/schemas/entities/export-document";
import { z } from "@/lib/zod";

export const createIdeasListExportResponseSchema = z
  .object({
    data: exportDocumentShortSchema,
  })
  .meta({
    title: "Create ideas list export response",
    description: "Create ideas list export response description",
    ref: "CreateIdeasListExportResponseSchema",
  });

export type CreateIdeasListExportResponse = z.infer<
  typeof createIdeasListExportResponseSchema
>;
