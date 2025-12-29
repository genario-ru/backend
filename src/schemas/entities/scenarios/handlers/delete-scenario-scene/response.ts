import * as z from "zod";

import { scenarioSceneSchema } from "../../entities/scenario-scene";
import { scenariosRegistry } from "../../registry";

export const deleteScenarioSceneResponseSchema = z
  .object({
    data: scenarioSceneSchema,
  })
  .register(scenariosRegistry, {
    title: "Delete scenario scene response",
    description: "Delete scenario scene response description",
    ref: "DeleteScenarioSceneResponseSchema",
  });

export type DeleteScenarioSceneResponse = z.infer<
  typeof deleteScenarioSceneResponseSchema
>;
