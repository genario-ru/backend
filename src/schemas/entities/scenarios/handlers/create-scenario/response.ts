import * as z from "zod";

import { scenarioSchema } from "../../entities/scenario";
import { scenariosRegistry } from "../../registry";

export const createScenarioResponseSchema = z
  .object({
    data: scenarioSchema,
  })
  .register(scenariosRegistry, {
    title: "Create scenario response",
    description: "Create scenario response description",
    ref: "CreateScenarioResponseSchema",
  });

export type CreateScenarioResponse = z.infer<
  typeof createScenarioResponseSchema
>;
