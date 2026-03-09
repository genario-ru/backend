import { z } from "@/lib/zod";

export const updateScenarioSceneParamsSchema = z
  .object({
    sceneId: z.uuid(),
  })
  .meta({
    title: "Update scenario scene params",
    description: "Update scenario scene params description",
    ref: "UpdateScenarioSceneParamsSchema",
  });

export type UpdateScenarioSceneParams = z.infer<
  typeof updateScenarioSceneParamsSchema
>;
