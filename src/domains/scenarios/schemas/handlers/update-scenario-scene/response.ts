import { z } from "@/lib/zod";

import { scenarioSceneSchema } from "../../entities/scenario-scene";

export const updateScenarioSceneResponseSchema = z
  .object({
    data: scenarioSceneSchema,
  })
  .meta({
    title: "Update scenario scene response",
    description: "Update scenario scene response description",
    ref: "UpdateScenarioSceneResponseSchema",
  });

export type UpdateScenarioSceneResponse = z.infer<
  typeof updateScenarioSceneResponseSchema
>;
