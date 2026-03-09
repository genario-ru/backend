import { z } from "@/lib/zod";

export const deleteScenarioParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .meta({
    title: "Delete scenario params",
    description: "Delete scenario params description",
    ref: "DeleteScenarioParamsSchema",
  });

export type DeleteScenarioParams = z.infer<typeof deleteScenarioParamsSchema>;
