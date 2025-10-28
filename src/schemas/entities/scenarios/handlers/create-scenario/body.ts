import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

import { scenario } from "@/db/schema";

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
  });

export type CreateScenarioBody = z.infer<typeof createScenarioBodySchema>;
