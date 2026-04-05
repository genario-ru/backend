import { exportDocumentShortSchema } from "@/domains/export-document/schemas/entities/export-document";
import { z } from "@/lib/zod";

export const getScenarioVersionExportsResponseSchema = z
  .object({
    data: z.array(exportDocumentShortSchema),
  })
  .meta({
    title: "Get scenario version exports response",
    description: "Get scenario version exports response description",
    ref: "GetScenarioVersionExportsResponseSchema",
  });

export type GetScenarioVersionExportsResponse = z.infer<
  typeof getScenarioVersionExportsResponseSchema
>;
