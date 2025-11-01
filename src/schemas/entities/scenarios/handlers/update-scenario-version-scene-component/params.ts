import * as z from "zod";

export const updateScenarioVersionSceneComponentParamsSchema = z.object({
  scenarioId: z.uuid(),
  versionId: z.uuid(),
  chapterId: z.uuid(),
  sceneId: z.uuid(),
  sceneComponentId: z.uuid(),
});

export type UpdateScenarioVersionSceneComponentParams = z.infer<
  typeof updateScenarioVersionSceneComponentParamsSchema
>;
