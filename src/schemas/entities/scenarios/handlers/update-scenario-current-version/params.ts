import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const updateScenarioCurrentVersionParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Update scenario current version params",
    description: "Update scenario current version params description",
    ref: "UpdateScenarioCurrentVersionParamsSchema",
  });

export type UpdateScenarioCurrentVersionParams = z.infer<
  typeof updateScenarioCurrentVersionParamsSchema
>;
