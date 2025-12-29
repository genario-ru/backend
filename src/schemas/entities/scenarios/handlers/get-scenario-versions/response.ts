import * as z from "zod";

import { scenarioVersionSchema } from "../../entities/scenario-version";
import { scenariosRegistry } from "../../registry";

export const getScenarioVersionsResponseSchema = z
  .object({
    data: z.array(scenarioVersionSchema),
  })
  .register(scenariosRegistry, {
    title: "Get scenario versions response",
    description: "Get scenario versions response description",
    ref: "GetScenarioVersionsResponseSchema",
  });

export type GetScenarioVersionsResponse = z.infer<
  typeof getScenarioVersionsResponseSchema
>;
