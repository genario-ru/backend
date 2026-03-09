import { z } from "@/lib/zod";

import { scenariosRegistry } from "../../registry";

export const deleteScenarioSceneComponentParamsSchema = z
  .object({
    sceneComponentId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Delete scenario scene component params",
    description: "Delete scenario scene component params description",
    ref: "DeleteScenarioSceneComponentParamsSchema",
  });

export type DeleteScenarioSceneComponentParams = z.infer<
  typeof deleteScenarioSceneComponentParamsSchema
>;
