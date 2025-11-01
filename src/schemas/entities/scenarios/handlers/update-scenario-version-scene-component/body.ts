import * as z from "zod";

export const updateScenarioVersionSceneComponentBodySchema = z.object({
  name: z.string().optional(),
  content: z.string().nullish(),
  icon: z.string().nullish(),
  color: z.string().nullish(),
});

export type UpdateScenarioVersionSceneComponentBody = z.infer<
  typeof updateScenarioVersionSceneComponentBodySchema
>;
