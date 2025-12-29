import * as z from "zod";

import { scenarioVersionExtendedSchema } from "../../entities/scenario-version";
import { scenariosRegistry } from "../../registry";

export const getScenarioVersionResponseSchema = z
  .object({
    data: scenarioVersionExtendedSchema,
  })
  .register(scenariosRegistry, {
    title: "Get scenario version response",
    description: "Get scenario version response description",
    ref: "GetScenarioVersionResponseSchema",
  });

export type GetScenarioVersionResponse = z.infer<
  typeof getScenarioVersionResponseSchema
>;
