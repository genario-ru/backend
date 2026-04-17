import { createInsertSchema } from "drizzle-zod";

import { scenario } from "@/db/schema";
import { z } from "@/lib/zod";

export const createScenarioBodySchema = createInsertSchema(scenario)
  .pick({
    templateId: true,
    videoTypeId: true,
    videoDurationId: true,
    profileId: true,
    targetAudience: true,
  })
  .extend({
    name: z.string().min(3).max(256),
    description: z.string().min(16).max(4096),
    platformIds: z.array(z.uuid()).nullish(),
    toneIds: z.array(z.uuid()).nullish(),
  })
  .meta({
    title: "Create scenario body",
    description: "Create scenario body description",
    ref: "CreateScenarioBodySchema",
  });

export type CreateScenarioBody = z.infer<typeof createScenarioBodySchema>;
