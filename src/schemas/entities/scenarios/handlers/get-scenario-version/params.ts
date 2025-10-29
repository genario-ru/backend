import * as z from "zod";

export const getScenarioVersionParamsSchema = z.object({
  scenarioId: z.uuid(),
  versionId: z.uuid(),
});

export type GetScenarioVersionParams = z.infer<
  typeof getScenarioVersionParamsSchema
>;
