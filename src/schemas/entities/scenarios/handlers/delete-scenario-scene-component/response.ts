import { z } from "@/lib/zod";

import { scenarioSceneComponentSchema } from "../../entities/scenario-scene-component";
import { scenariosRegistry } from "../../registry";

export const deleteScenarioSceneComponentResponseSchema = z
  .object({
    data: scenarioSceneComponentSchema,
  })
  .register(scenariosRegistry, {
    title: "Delete scenario scene component response",
    description: "Delete scenario scene component response description",
    ref: "DeleteScenarioSceneComponentResponseSchema",
  });

export type DeleteScenarioSceneComponentResponse = z.infer<
  typeof deleteScenarioSceneComponentResponseSchema
>;
