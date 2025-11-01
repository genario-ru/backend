import * as z from "zod";

export const deleteScenarioVersionSceneComponentParamsSchema = z.object({
  scenarioId: z.uuid(),
  versionId: z.uuid(),
  chapterId: z.uuid(),
  sceneId: z.uuid(),
  sceneComponentId: z.uuid(),
});

export type DeleteScenarioVersionSceneComponentParams = z.infer<
  typeof deleteScenarioVersionSceneComponentParamsSchema
>;
