import { z } from "@/lib/zod";
import { exportDocumentShortSchema } from "@/schemas/entities/export-document/entities/export-document";

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
