import { z } from "@/lib/zod";

import { scenarioSceneComponentSchema } from "../../entities/scenario-scene-component";
import { scenariosRegistry } from "../../registry";

export const updateScenarioSceneComponentResponseSchema = z
  .object({
    data: scenarioSceneComponentSchema,
  })
  .register(scenariosRegistry, {
    title: "Update scenario scene component response",
    description: "Update scenario scene component response description",
    ref: "UpdateScenarioSceneComponentResponseSchema",
  });

export type UpdateScenarioSceneComponentResponse = z.infer<
  typeof updateScenarioSceneComponentResponseSchema
>;
