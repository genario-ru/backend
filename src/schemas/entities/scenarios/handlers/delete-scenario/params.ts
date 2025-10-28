import * as z from "zod";

export const deleteScenarioParamsSchema = z.object({
  scenarioId: z.string().uuid(),
});

export type DeleteScenarioParams = z.infer<typeof deleteScenarioParamsSchema>;
