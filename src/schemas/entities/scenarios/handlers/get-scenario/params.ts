import * as z from "zod";

export const getScenarioParamsSchema = z.object({
  scenarioId: z.string().uuid(),
});

export type GetScenarioParams = z.infer<typeof getScenarioParamsSchema>;
