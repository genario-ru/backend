import { z } from "@/lib/zod";

export const deleteScenarioParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type DeleteScenarioParams = z.infer<typeof deleteScenarioParamsSchema>;
