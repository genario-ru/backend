import * as z from "zod";

export const updateScenarioSceneComponentParamsSchema = z.object({
  sceneComponentId: z.uuid(),
});

export type UpdateScenarioSceneComponentParams = z.infer<
  typeof updateScenarioSceneComponentParamsSchema
>;
