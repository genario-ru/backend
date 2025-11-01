import * as z from "zod";

export const updateScenarioSceneBodySchema = z.object({
  previewId: z.uuid().nullish(),
  status: z.enum(["pending", "generation", "failed", "ready"]).optional(),
  name: z.string().optional(),
  description: z.string().nullish(),
  startTime: z.number().int().optional(),
  endTime: z.number().int().optional(),
  badges: z.string().nullish(),
});

export type UpdateScenarioSceneBody = z.infer<
  typeof updateScenarioSceneBodySchema
>;
