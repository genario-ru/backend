import { exportDocumentShortSchema } from "@/domains/export-document/schemas/entities/export-document";
import { z } from "@/lib/zod";

export const getScenarioExportsResponseSchema = z
  .object({
    data: z.array(exportDocumentShortSchema),
  })
  .meta({
    title: "Get scenario exports response",
    description: "Get scenario exports response description",
    ref: "GetScenarioExportsResponseSchema",
  });

export type GetScenarioExportsResponse = z.infer<
  typeof getScenarioExportsResponseSchema
>;
