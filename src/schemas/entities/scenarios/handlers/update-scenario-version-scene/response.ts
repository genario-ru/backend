import * as z from "zod";

import { scenarioSceneSchema } from "../../entities/scenario-scene";

export const updateScenarioVersionSceneResponseSchema = z.object({
  data: scenarioSceneSchema,
});

export type UpdateScenarioVersionSceneResponse = z.infer<
  typeof updateScenarioVersionSceneResponseSchema
>;
