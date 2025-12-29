import * as z from "zod";

import { scenarioExtendedSchema } from "../../entities/scenario";
import { scenariosRegistry } from "../../registry";

export const getScenarioResponseSchema = z
  .object({
    data: scenarioExtendedSchema,
  })
  .register(scenariosRegistry, {
    title: "Get scenario response",
    description: "Get scenario response description",
    ref: "GetScenarioResponseSchema",
  });

export type GetScenarioResponse = z.infer<typeof getScenarioResponseSchema>;
