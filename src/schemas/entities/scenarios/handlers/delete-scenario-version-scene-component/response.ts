import * as z from "zod";

import { scenarioSceneComponentSchema } from "../../entities/scenario-scene-component";

export const deleteScenarioVersionSceneComponentResponseSchema = z.object({
  data: scenarioSceneComponentSchema,
});

export type DeleteScenarioVersionSceneComponentResponse = z.infer<
  typeof deleteScenarioVersionSceneComponentResponseSchema
>;
