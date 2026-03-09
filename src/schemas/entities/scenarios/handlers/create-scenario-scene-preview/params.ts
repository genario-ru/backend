import { z } from "@/lib/zod";

export const createScenarioScenePreviewParamsSchema = z
  .object({
    sceneId: z.uuid(),
  })
  .meta({
    title: "Create scenario scene preview params",
    description: "Create scenario scene preview params description",
    ref: "CreateScenarioScenePreviewParamsSchema",
  });

export type CreateScenarioScenePreviewParams = z.infer<
  typeof createScenarioScenePreviewParamsSchema
>;
