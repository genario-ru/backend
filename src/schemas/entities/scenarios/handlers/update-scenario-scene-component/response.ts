import * as z from "zod";

import { scenarioSceneComponentSchema } from "../../entities/scenario-scene-component";

export const updateScenarioSceneComponentResponseSchema = z.object({
  data: scenarioSceneComponentSchema,
});

export type UpdateScenarioSceneComponentResponse = z.infer<
  typeof updateScenarioSceneComponentResponseSchema
>;
