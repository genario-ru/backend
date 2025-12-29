import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const updateScenarioSceneParamsSchema = z
  .object({
    sceneId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Update scenario scene params",
    description: "Update scenario scene params description",
    ref: "UpdateScenarioSceneParamsSchema",
  });

export type UpdateScenarioSceneParams = z.infer<
  typeof updateScenarioSceneParamsSchema
>;
