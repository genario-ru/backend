import { z } from "@/lib/zod";

import { scenariosRegistry } from "../../registry";

export const createScenarioScenePreviewParamsSchema = z
  .object({
    sceneId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Create scenario scene preview params",
    description: "Create scenario scene preview params description",
    ref: "CreateScenarioScenePreviewParamsSchema",
  });

export type CreateScenarioScenePreviewParams = z.infer<
  typeof createScenarioScenePreviewParamsSchema
>;
