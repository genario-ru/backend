import { z } from "@/lib/zod";

export const updateScenarioSceneComponentBodySchema = z
  .object({
    name: z.string().min(1).max(256),
    content: z.string().min(1).max(4096),
  })
  .meta({
    title: "Update scenario scene component body",
    description: "Update scenario scene component body description",
    ref: "UpdateScenarioSceneComponentBodySchema",
  });

export type UpdateScenarioSceneComponentBody = z.infer<
  typeof updateScenarioSceneComponentBodySchema
>;
