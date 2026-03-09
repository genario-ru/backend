import { z } from "@/lib/zod";

import { scenariosRegistry } from "../../registry";

export const getScenarioParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Get scenario params",
    description: "Get scenario params description",
    ref: "GetScenarioParamsSchema",
  });

export type GetScenarioParams = z.infer<typeof getScenarioParamsSchema>;
