import { z } from "@/lib/zod";

export const updateScenarioParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type UpdateScenarioParams = z.infer<typeof updateScenarioParamsSchema>;
