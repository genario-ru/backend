import { z } from "@/lib/zod";

import { scenarioSceneSchema } from "../../entities/scenario-scene";
import { scenariosRegistry } from "../../registry";

export const updateScenarioSceneResponseSchema = z
  .object({
    data: scenarioSceneSchema,
  })
  .register(scenariosRegistry, {
    title: "Update scenario scene response",
    description: "Update scenario scene response description",
    ref: "UpdateScenarioSceneResponseSchema",
  });

export type UpdateScenarioSceneResponse = z.infer<
  typeof updateScenarioSceneResponseSchema
>;
