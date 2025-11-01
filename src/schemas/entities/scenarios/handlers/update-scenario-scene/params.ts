import * as z from "zod";

export const updateScenarioSceneParamsSchema = z.object({
  sceneId: z.uuid(),
});

export type UpdateScenarioSceneParams = z.infer<
  typeof updateScenarioSceneParamsSchema
>;
