import * as z from "zod";

import { scenarioSceneSchema } from "../../entities/scenario-scene";

export const updateScenarioSceneResponseSchema = z.object({
  data: scenarioSceneSchema,
});

export type UpdateScenarioSceneResponse = z.infer<
  typeof updateScenarioSceneResponseSchema
>;
