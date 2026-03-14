import { generationStatus } from "@/db/schema";
import { z } from "@/lib/zod";

export const scenarioVersionExportItemSchema = z
  .object({
    name: z.string(),
    format: z.enum(["pdf", "docx"]),
    state: generationStatus,
    url: z.string().nullable(),
  })
  .meta({
    title: "Scenario version export item",
    description: "Scenario version export item description",
    ref: "ScenarioVersionExportItemSchema",
  });

export type ScenarioVersionExportItem = z.infer<
  typeof scenarioVersionExportItemSchema
>;

export const getScenarioVersionExportsResponseSchema = z
  .object({
    data: z.array(scenarioVersionExportItemSchema),
  })
  .meta({
    title: "Get scenario version exports response",
    description: "Get scenario version exports response description",
    ref: "GetScenarioVersionExportsResponseSchema",
  });

export type GetScenarioVersionExportsResponse = z.infer<
  typeof getScenarioVersionExportsResponseSchema
>;
