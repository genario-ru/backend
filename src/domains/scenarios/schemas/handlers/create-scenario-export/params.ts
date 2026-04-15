import { z } from "@/lib/zod";

export const createScenarioExportParamsSchema = z.object({
  scenarioId: z.uuid(),
});

export type CreateScenarioExportParams = z.infer<
  typeof createScenarioExportParamsSchema
>;
