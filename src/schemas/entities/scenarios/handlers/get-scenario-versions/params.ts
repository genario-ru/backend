import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const getScenarioVersionsParamsSchema = z
  .object({
    scenarioId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Get scenario versions params",
    description: "Get scenario versions params description",
    ref: "GetScenarioVersionsParamsSchema",
  });

export type GetScenarioVersionsParams = z.infer<
  typeof getScenarioVersionsParamsSchema
>;
