import { z } from "@/lib/zod";

export const deleteScenarioSceneComponentParamsSchema = z
  .object({
    sceneComponentId: z.uuid(),
  })
  .meta({
    title: "Delete scenario scene component params",
    description: "Delete scenario scene component params description",
    ref: "DeleteScenarioSceneComponentParamsSchema",
  });

export type DeleteScenarioSceneComponentParams = z.infer<
  typeof deleteScenarioSceneComponentParamsSchema
>;
