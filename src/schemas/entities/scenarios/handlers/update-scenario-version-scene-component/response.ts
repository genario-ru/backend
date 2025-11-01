import * as z from "zod";

import { scenarioSceneComponentSchema } from "../../entities/scenario-scene-component";

export const updateScenarioVersionSceneComponentResponseSchema = z.object({
  data: scenarioSceneComponentSchema,
});

export type UpdateScenarioVersionSceneComponentResponse = z.infer<
  typeof updateScenarioVersionSceneComponentResponseSchema
>;
