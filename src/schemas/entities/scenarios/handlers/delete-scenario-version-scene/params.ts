import * as z from "zod";

export const deleteScenarioVersionSceneParamsSchema = z.object({
  scenarioId: z.uuid(),
  versionId: z.uuid(),
  chapterId: z.uuid(),
  sceneId: z.uuid(),
});

export type DeleteScenarioVersionSceneParams = z.infer<
  typeof deleteScenarioVersionSceneParamsSchema
>;
