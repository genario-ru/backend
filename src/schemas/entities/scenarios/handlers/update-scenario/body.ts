import { createUpdateSchema } from "drizzle-zod";
import * as z from "zod";

import { scenario } from "@/db/schema";

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
  });

export type UpdateScenarioBody = z.infer<typeof updateScenarioBodySchema>;
