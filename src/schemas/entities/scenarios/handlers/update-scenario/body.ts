import { createUpdateSchema } from "drizzle-zod";

import { scenario } from "@/db/schema";
import { z } from "@/lib/zod";

import { scenariosRegistry } from "../../registry";

export const updateScenarioBodySchema = createUpdateSchema(scenario)
  .pick({
    name: true,
    description: true,
    templateId: true,
    videoTypeId: true,
    videoDurationId: true,
    platformId: true,
    profileId: true,
    targetAudience: true,
  })
  .extend({
    toneIds: z.array(z.uuid()).optional(),
  })
  .register(scenariosRegistry, {
    title: "Update scenario body",
    description: "Update scenario body description",
    ref: "UpdateScenarioBodySchema",
  });

export type UpdateScenarioBody = z.infer<typeof updateScenarioBodySchema>;
