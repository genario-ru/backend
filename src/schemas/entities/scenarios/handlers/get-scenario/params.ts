import { z } from "@/lib/zod";

export const getScenarioParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type GetScenarioParams = z.infer<typeof getScenarioParamsSchema>;
