import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const saveScenarioParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Save scenario params",
    description: "Save scenario params description",
    ref: "SaveScenarioParamsSchema",
  });

export type SaveScenarioParams = z.infer<typeof saveScenarioParamsSchema>;
