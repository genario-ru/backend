import { createUpdateSchema } from "drizzle-zod";

import { scenario } from "@/db/schema";
import { z } from "@/lib/zod";

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
    name: z.string().min(3).max(256),
    description: z.string().min(16).max(4096),
    toneIds: z.array(z.uuid()).nullish(),
  })
  .meta({
    title: "Update scenario body",
    description: "Update scenario body description",
    ref: "UpdateScenarioBodySchema",
  });

export type UpdateScenarioBody = z.infer<typeof updateScenarioBodySchema>;
