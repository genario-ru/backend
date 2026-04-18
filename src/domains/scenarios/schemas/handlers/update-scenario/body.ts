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
    profileId: true,
    productionStatusId: true,
    targetAudience: true,
  })
  .extend({
    name: z.string().min(3).max(256).optional(),
    description: z.string().min(16).max(4096).optional(),
    platformIds: z.array(z.uuid()).nullish(),
    toneIds: z.array(z.uuid()).nullish(),
    regenerate: z.boolean().nullish(),
  })
  .meta({
    title: "Update scenario body",
    description: "Update scenario body description",
    ref: "UpdateScenarioBodySchema",
  });

export type UpdateScenarioBody = z.infer<typeof updateScenarioBodySchema>;
