import * as z from "zod";

import { scenarioSceneSchema } from "../../entities/scenario-scene";

export const deleteScenarioSceneResponseSchema = z.object({
  data: scenarioSceneSchema,
});

export type DeleteScenarioSceneResponse = z.infer<
  typeof deleteScenarioSceneResponseSchema
>;
