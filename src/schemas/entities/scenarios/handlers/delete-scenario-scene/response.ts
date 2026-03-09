import { z } from "@/lib/zod";

import { scenarioSceneSchema } from "../../entities/scenario-scene";
export const deleteScenarioSceneResponseSchema = z
  .object({
    data: scenarioSceneSchema,
  })
  .meta({
    title: "Delete scenario scene response",
    description: "Delete scenario scene response description",
    ref: "DeleteScenarioSceneResponseSchema",
  });

export type DeleteScenarioSceneResponse = z.infer<
  typeof deleteScenarioSceneResponseSchema
>;
