import { z } from "@/lib/zod";

export const getScenarioCurrentVersionParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type GetScenarioCurrentVersionParams = z.infer<
  typeof getScenarioCurrentVersionParamsSchema
>;
