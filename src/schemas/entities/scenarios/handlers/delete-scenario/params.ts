import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const deleteScenarioParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Delete scenario params",
    description: "Delete scenario params description",
    ref: "DeleteScenarioParamsSchema",
  });

export type DeleteScenarioParams = z.infer<typeof deleteScenarioParamsSchema>;
