import { z } from "@/lib/zod";

export const getScenarioExportsParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type GetScenarioExportsParams = z.infer<
  typeof getScenarioExportsParamsSchema
>;
