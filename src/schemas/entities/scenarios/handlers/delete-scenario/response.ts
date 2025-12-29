import * as z from "zod";

import { scenarioSchema } from "../../entities/scenario";
import { scenariosRegistry } from "../../registry";

export const deleteScenarioResponseSchema = z
  .object({
    data: scenarioSchema,
  })
  .register(scenariosRegistry, {
    title: "Delete scenario response",
    description: "Delete scenario response description",
    ref: "DeleteScenarioResponseSchema",
  });

export type DeleteScenarioResponse = z.infer<
  typeof deleteScenarioResponseSchema
>;
