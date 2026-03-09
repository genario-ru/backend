import { createInsertSchema } from "drizzle-zod";

import { scenario } from "@/db/schema";
import { z } from "@/lib/zod";

import { scenariosRegistry } from "../../registry";

export const createScenarioBodySchema = createInsertSchema(scenario)
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
    title: "Create scenario body",
    description: "Create scenario body description",
    ref: "CreateScenarioBodySchema",
  });

export type CreateScenarioBody = z.infer<typeof createScenarioBodySchema>;
