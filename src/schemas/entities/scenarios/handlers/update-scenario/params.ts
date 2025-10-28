import * as z from "zod";

export const updateScenarioParamsSchema = z.object({
  scenarioId: z.string().uuid(),
});

export type UpdateScenarioParams = z.infer<typeof updateScenarioParamsSchema>;
