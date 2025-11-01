import * as z from "zod";

export const updateScenarioVersionSceneBodySchema = z.object({
  previewId: z.uuid().nullish(),
  status: z.enum(["pending", "generation", "failed", "ready"]).optional(),
  name: z.string().optional(),
  description: z.string().nullish(),
  startTime: z.number().int().optional(),
  endTime: z.number().int().optional(),
  badges: z.string().nullish(),
});

export type UpdateScenarioVersionSceneBody = z.infer<
  typeof updateScenarioVersionSceneBodySchema
>;
