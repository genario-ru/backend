import { z } from "@/lib/zod";

export const deleteScenarioSceneComponentParamsSchema = z.object({
  sceneComponentId: z.uuid(),
});

export type DeleteScenarioSceneComponentParams = z.infer<
  typeof deleteScenarioSceneComponentParamsSchema
>;
