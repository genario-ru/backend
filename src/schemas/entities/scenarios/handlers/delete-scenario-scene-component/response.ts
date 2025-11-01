import * as z from "zod";

import { scenarioSceneComponentSchema } from "../../entities/scenario-scene-component";

export const deleteScenarioSceneComponentResponseSchema = z.object({
  data: scenarioSceneComponentSchema,
});

export type DeleteScenarioSceneComponentResponse = z.infer<
  typeof deleteScenarioSceneComponentResponseSchema
>;
