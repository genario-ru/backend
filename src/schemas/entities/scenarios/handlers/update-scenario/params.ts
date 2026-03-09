import { z } from "@/lib/zod";

import { scenariosRegistry } from "../../registry";

export const updateScenarioParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Update scenario params",
    description: "Update scenario params description",
    ref: "UpdateScenarioParamsSchema",
  });

export type UpdateScenarioParams = z.infer<typeof updateScenarioParamsSchema>;
