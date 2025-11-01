import * as z from "zod";

export const updateScenarioVersionSceneParamsSchema = z.object({
  scenarioId: z.uuid(),
  versionId: z.uuid(),
  chapterId: z.uuid(),
  sceneId: z.uuid(),
});

export type UpdateScenarioVersionSceneParams = z.infer<
  typeof updateScenarioVersionSceneParamsSchema
>;
