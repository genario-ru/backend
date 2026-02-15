import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const getScenarioCurrentVersionParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Get scenario current version params",
    description: "Get scenario current version params description",
    ref: "GetScenarioCurrentVersionParamsSchema",
  });

export type GetScenarioCurrentVersionParams = z.infer<
  typeof getScenarioCurrentVersionParamsSchema
>;
