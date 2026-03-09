import { z } from "@/lib/zod";

export const getScenarioCurrentVersionParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .meta({
    title: "Get scenario current version params",
    description: "Get scenario current version params description",
    ref: "GetScenarioCurrentVersionParamsSchema",
  });

export type GetScenarioCurrentVersionParams = z.infer<
  typeof getScenarioCurrentVersionParamsSchema
>;
