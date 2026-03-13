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
    name: z.string().min(3).max(256),
    description: z.string().min(16).max(4096),
    toneIds: z.array(z.uuid()).nullish(),
    videoTypeIds: z.array(z.uuid()),
    regenerate: z.boolean().nullish(),
  })
  .meta({
    title: "Update ideas list body",
    description: "Update ideas list body description",
    ref: "UpdateIdeasListBodySchema",
  });

export type UpdateIdeasListBody = z.infer<typeof updateIdeasListBodySchema>;
