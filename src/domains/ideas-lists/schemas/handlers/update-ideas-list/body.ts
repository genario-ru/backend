import { createUpdateSchema } from "drizzle-zod";

import { ideasList } from "@/db/schema";
import { z } from "@/lib/zod";

export const updateIdeasListBodySchema = createUpdateSchema(ideasList)
  .pick({
    templateId: true,
    profileId: true,
    targetAudience: true,
  })
  .extend({
    prompt: z.string().min(3).max(4096).optional(),
    toneIds: z.array(z.uuid()).nullish(),
    videoTypeIds: z.array(z.uuid()).min(1),
    regenerate: z.boolean().nullish(),
  })
  .meta({
    title: "Update ideas list body",
    description: "Update ideas list body description",
    ref: "UpdateIdeasListBodySchema",
  });

export type UpdateIdeasListBody = z.infer<typeof updateIdeasListBodySchema>;
