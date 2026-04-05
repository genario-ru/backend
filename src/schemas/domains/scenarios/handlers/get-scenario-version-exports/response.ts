import { z } from "@/lib/zod";
import { exportDocumentShortSchema } from "@/schemas/domains/export-document/entities/export-document";

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
