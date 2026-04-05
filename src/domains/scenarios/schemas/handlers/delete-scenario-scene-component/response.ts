import { z } from "@/lib/zod";

import { scenarioSceneComponentSchema } from "../../entities/scenario-scene-component";
export const deleteScenarioSceneComponentResponseSchema = z
  .object({
    data: scenarioSceneComponentSchema,
  })
  .meta({
    title: "Delete scenario scene component response",
    description: "Delete scenario scene component response description",
    ref: "DeleteScenarioSceneComponentResponseSchema",
  });

export type DeleteScenarioSceneComponentResponse = z.infer<
  typeof deleteScenarioSceneComponentResponseSchema
>;
