import * as z from "zod";

export const updateScenarioSceneComponentBodySchema = z.object({
  name: z.string().optional(),
  content: z.string().nullish(),
  icon: z.string().nullish(),
  color: z.string().nullish(),
});

export type UpdateScenarioSceneComponentBody = z.infer<
  typeof updateScenarioSceneComponentBodySchema
>;
