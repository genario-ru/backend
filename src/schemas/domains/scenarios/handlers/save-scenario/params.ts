import { z } from "@/lib/zod";

export const saveScenarioParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type SaveScenarioParams = z.infer<typeof saveScenarioParamsSchema>;
