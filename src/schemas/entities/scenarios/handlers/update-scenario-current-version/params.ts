import { z } from "@/lib/zod";

export const updateScenarioCurrentVersionParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .meta({
    title: "Update scenario current version params",
    description: "Update scenario current version params description",
    ref: "UpdateScenarioCurrentVersionParamsSchema",
  });

export type UpdateScenarioCurrentVersionParams = z.infer<
  typeof updateScenarioCurrentVersionParamsSchema
>;
