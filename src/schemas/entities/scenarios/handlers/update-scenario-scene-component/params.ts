import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const updateScenarioSceneComponentParamsSchema = z
  .object({
    sceneComponentId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Update scenario scene component params",
    description: "Update scenario scene component params description",
    ref: "UpdateScenarioSceneComponentParamsSchema",
  });

export type UpdateScenarioSceneComponentParams = z.infer<
  typeof updateScenarioSceneComponentParamsSchema
>;
