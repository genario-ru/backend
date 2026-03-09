import { z } from "@/lib/zod";

export const getScenarioParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .meta({
    title: "Get scenario params",
    description: "Get scenario params description",
    ref: "GetScenarioParamsSchema",
  });

export type GetScenarioParams = z.infer<typeof getScenarioParamsSchema>;
