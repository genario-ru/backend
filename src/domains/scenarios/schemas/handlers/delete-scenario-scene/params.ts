import { z } from "@/lib/zod";

export const deleteScenarioSceneParamsSchema = z.object({
  sceneId: z.uuid(),
});

export type DeleteScenarioSceneParams = z.infer<
  typeof deleteScenarioSceneParamsSchema
>;
