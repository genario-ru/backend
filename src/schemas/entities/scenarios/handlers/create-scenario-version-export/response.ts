import { z } from "@/lib/zod";
import { scenarioVersionExportWithUrlSchema } from "@/schemas/entities/scenarios/entities/scenario-version-export";

export const createScenarioVersionExportResponseSchema = z
  .object({
    data: scenarioVersionExportWithUrlSchema,
  })
  .meta({
    title: "Create scenario version export response",
    description: "Create scenario version export response description",
    ref: "CreateScenarioVersionExportResponseSchema",
  });

export type CreateScenarioVersionExportResponse = z.infer<
  typeof createScenarioVersionExportResponseSchema
>;
