import * as z from "zod";

export const deleteScenarioVersionParamsSchema = z.object({
  scenarioId: z.uuid(),
  versionId: z.uuid(),
});

export type DeleteScenarioVersionParams = z.infer<
  typeof deleteScenarioVersionParamsSchema
>;
