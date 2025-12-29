import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const updateScenarioSceneBodySchema = z
  .object({
    previewId: z.uuid().nullish(),
    status: z.enum(["pending", "generation", "failed", "ready"]).optional(),
    name: z.string().optional(),
    description: z.string().nullish(),
    startTime: z.number().int().optional(),
    endTime: z.number().int().optional(),
    badges: z.string().nullish(),
  })
  .register(scenariosRegistry, {
    title: "Update scenario scene body",
    description: "Update scenario scene body description",
    ref: "UpdateScenarioSceneBodySchema",
  });

export type UpdateScenarioSceneBody = z.infer<
  typeof updateScenarioSceneBodySchema
>;
