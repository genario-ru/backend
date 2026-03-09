import { z } from "@/lib/zod";

export const updateScenarioSceneComponentBodySchema = z
  .object({
    name: z.string().optional(),
    content: z.string().nullish(),
    icon: z.string().nullish(),
    color: z.string().nullish(),
  })
  .meta({
    title: "Update scenario scene component body",
    description: "Update scenario scene component body description",
    ref: "UpdateScenarioSceneComponentBodySchema",
  });

export type UpdateScenarioSceneComponentBody = z.infer<
  typeof updateScenarioSceneComponentBodySchema
>;
