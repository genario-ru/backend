import { z } from "@/lib/zod";

export const saveScenarioParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .meta({
    title: "Save scenario params",
    description: "Save scenario params description",
    ref: "SaveScenarioParamsSchema",
  });

export type SaveScenarioParams = z.infer<typeof saveScenarioParamsSchema>;
