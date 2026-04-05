import { z } from "@/lib/zod";

export const deleteScenarioVersionParamsSchema = z.object({
  versionId: z.uuid(),
});

export type DeleteScenarioVersionParams = z.infer<
  typeof deleteScenarioVersionParamsSchema
>;
