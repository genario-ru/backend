import { z } from "@/lib/zod";

export const getScenarioVersionsParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .meta({
    title: "Get scenario versions params",
    description: "Get scenario versions params description",
    ref: "GetScenarioVersionsParamsSchema",
  });

export type GetScenarioVersionsParams = z.infer<
  typeof getScenarioVersionsParamsSchema
>;
