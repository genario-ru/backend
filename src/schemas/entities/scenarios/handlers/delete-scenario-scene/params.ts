import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const deleteScenarioSceneParamsSchema = z
  .object({
    sceneId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Delete scenario scene params",
    description: "Delete scenario scene params description",
    ref: "DeleteScenarioSceneParamsSchema",
  });

export type DeleteScenarioSceneParams = z.infer<
  typeof deleteScenarioSceneParamsSchema
>;
