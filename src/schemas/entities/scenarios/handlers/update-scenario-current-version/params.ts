import * as z from "zod";

export const updateScenarioCurrentVersionParamsSchema = z.object({
  scenarioId: z.string().uuid(),
});

export type UpdateScenarioCurrentVersionParams = z.infer<
  typeof updateScenarioCurrentVersionParamsSchema
>;
