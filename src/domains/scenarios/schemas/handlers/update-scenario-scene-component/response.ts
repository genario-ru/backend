import { z } from "@/lib/zod";

import { scenarioSceneComponentSchema } from "../../entities/scenario-scene-component";

export const updateScenarioSceneComponentResponseSchema = z
  .object({
    data: scenarioSceneComponentSchema,
  })
  .meta({
    title: "Update scenario scene component response",
    description: "Update scenario scene component response description",
    ref: "UpdateScenarioSceneComponentResponseSchema",
  });

export type UpdateScenarioSceneComponentResponse = z.infer<
  typeof updateScenarioSceneComponentResponseSchema
>;
