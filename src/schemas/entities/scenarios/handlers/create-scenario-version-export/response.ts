import { z } from "@/lib/zod";
import { exportDocumentShortSchema } from "@/schemas/entities/export-document/entities/export-document";

export const getScenarioVersionExportResponseSchema = z
  .object({
    data: exportDocumentShortSchema,
  })
  .meta({
    title: "Get scenario version export response",
    description: "Get scenario version export response description",
    ref: "GetScenarioVersionExportResponseSchema",
  });

export type GetScenarioVersionExportResponse = z.infer<
  typeof getScenarioVersionExportResponseSchema
>;
