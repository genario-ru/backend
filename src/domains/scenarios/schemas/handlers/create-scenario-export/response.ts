import { exportDocumentShortSchema } from "@/domains/export-document/schemas/entities/export-document";
import { z } from "@/lib/zod";

export const createScenarioExportResponseSchema = z
  .object({
    data: exportDocumentShortSchema,
  })
  .meta({
    title: "Create scenario export response",
    description: "Create scenario export response description",
    ref: "CreateScenarioExportResponseSchema",
  });

export type CreateScenarioExportResponse = z.infer<
  typeof createScenarioExportResponseSchema
>;
