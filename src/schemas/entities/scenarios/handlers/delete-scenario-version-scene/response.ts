import * as z from "zod";

import { scenarioSceneSchema } from "../../entities/scenario-scene";

export const deleteScenarioVersionSceneResponseSchema = z.object({
  data: scenarioSceneSchema,
});

export type DeleteScenarioVersionSceneResponse = z.infer<
  typeof deleteScenarioVersionSceneResponseSchema
>;
