import { z } from "@/lib/zod";

export const updateScenarioSceneBodySchema = z
  .object({
    name: z.string().min(3).max(256),
  })
  .meta({
    title: "Update scenario scene body",
    description: "Update scenario scene body description",
    ref: "UpdateScenarioSceneBodySchema",
  });

export type UpdateScenarioSceneBody = z.infer<
  typeof updateScenarioSceneBodySchema
>;
