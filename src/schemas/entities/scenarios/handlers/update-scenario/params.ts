import { z } from "@/lib/zod";

export const updateScenarioParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .meta({
    title: "Update scenario params",
    description: "Update scenario params description",
    ref: "UpdateScenarioParamsSchema",
  });

export type UpdateScenarioParams = z.infer<typeof updateScenarioParamsSchema>;
