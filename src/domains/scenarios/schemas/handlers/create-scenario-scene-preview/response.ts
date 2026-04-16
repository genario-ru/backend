import { z } from "@/lib/zod";

import { scenarioScenePreviewSchema } from "../../entities/scenario-scene-preview";

export const createScenarioScenePreviewResponseSchema = z
  .object({
    data: scenarioScenePreviewSchema,
  })
  .meta({
    title: "Create scenario scene preview response",
    description: "Create scenario scene preview response description",
    ref: "CreateScenarioScenePreviewResponseSchema",
  });

export type CreateScenarioScenePreviewResponse = z.infer<
  typeof createScenarioScenePreviewResponseSchema
>;
