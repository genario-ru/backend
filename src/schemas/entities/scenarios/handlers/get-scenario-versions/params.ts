import { z } from "@/lib/zod";

export const getScenarioVersionsParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type GetScenarioVersionsParams = z.infer<
  typeof getScenarioVersionsParamsSchema
>;
