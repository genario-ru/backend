import { z } from "@/lib/zod";

export const deleteScenarioSceneParamsSchema = z
  .object({
    sceneId: z.uuid(),
  })
  .meta({
    title: "Delete scenario scene params",
    description: "Delete scenario scene params description",
    ref: "DeleteScenarioSceneParamsSchema",
  });

export type DeleteScenarioSceneParams = z.infer<
  typeof deleteScenarioSceneParamsSchema
>;
