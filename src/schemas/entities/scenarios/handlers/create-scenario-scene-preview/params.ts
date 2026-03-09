import { z } from "@/lib/zod";

export const createScenarioScenePreviewParamsSchema = z.object({
  sceneId: z.uuid(),
});

export type CreateScenarioScenePreviewParams = z.infer<
  typeof createScenarioScenePreviewParamsSchema
>;
