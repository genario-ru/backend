import { z } from "@/lib/zod";

export const updateScenarioCurrentVersionParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type UpdateScenarioCurrentVersionParams = z.infer<
  typeof updateScenarioCurrentVersionParamsSchema
>;
