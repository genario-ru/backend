import { z } from "@/lib/zod";

export const updateScenarioSceneComponentParamsSchema = z
  .object({
    sceneComponentId: z.uuid(),
  })
  .meta({
    title: "Update scenario scene component params",
    description: "Update scenario scene component params description",
    ref: "UpdateScenarioSceneComponentParamsSchema",
  });

export type UpdateScenarioSceneComponentParams = z.infer<
  typeof updateScenarioSceneComponentParamsSchema
>;
