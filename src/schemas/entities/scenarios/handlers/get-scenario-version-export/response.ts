import { z } from "@/lib/zod";
import { generationStatusSchema } from "@/schemas/common/generation-status";

export const scenarioVersionExportResponseItemSchema = z
  .object({
    name: z.string(),
    format: z.string(),
    status: generationStatusSchema,
    url: z.string().nullable(),
  })
  .meta({
    title: "Scenario version export response item",
    description: "Scenario version export response item description",
    ref: "ScenarioVersionExportResponseItemSchema",
  });

export type ScenarioVersionExportResponseItem = z.infer<
  typeof scenarioVersionExportResponseItemSchema
>;

export const getScenarioVersionExportResponseSchema = z
  .object({
    data: scenarioVersionExportResponseItemSchema,
  })
  .meta({
    title: "Get scenario version export response",
    description: "Get scenario version export response description",
    ref: "GetScenarioVersionExportResponseSchema",
  });

export type GetScenarioVersionExportResponse = z.infer<
  typeof getScenarioVersionExportResponseSchema
>;
