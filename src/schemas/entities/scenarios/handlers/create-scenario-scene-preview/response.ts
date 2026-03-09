import { z } from "@/lib/zod";

import { scenarioScenePreviewSchema } from "../../entities/scenario-scene-preview";
import { scenariosRegistry } from "../../registry";

export const createScenarioScenePreviewResponseSchema = z
  .object({
    data: scenarioScenePreviewSchema,
  })
  .register(scenariosRegistry, {
    title: "Create scenario scene preview response",
    description: "Create scenario scene preview response description",
    ref: "CreateScenarioScenePreviewResponseSchema",
  });

export type CreateScenarioScenePreviewResponse = z.infer<
  typeof createScenarioScenePreviewResponseSchema
>;
