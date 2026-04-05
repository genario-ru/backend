import { exportDocumentShortSchema } from "@/domains/export-document/schemas/entities/export-document";
import { z } from "@/lib/zod";

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
