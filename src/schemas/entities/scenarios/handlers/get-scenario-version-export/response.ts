import { z } from "@/lib/zod";
import { scenarioVersionExportWithUrlSchema } from "@/schemas/entities/scenarios/entities/scenario-version-export";

export const getScenarioVersionExportResponseSchema = z
  .object({
    data: scenarioVersionExportWithUrlSchema,
  })
  .meta({
    title: "Get scenario version export response",
    description: "Get scenario version export response description",
    ref: "GetScenarioVersionExportResponseSchema",
  });

export type GetScenarioVersionExportResponse = z.infer<
  typeof getScenarioVersionExportResponseSchema
>;
