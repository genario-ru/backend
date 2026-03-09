import { createUpdateSchema } from "drizzle-zod";

import { ideasList } from "@/db/schema";
import { z } from "@/lib/zod";

export const updateIdeasListBodySchema = createUpdateSchema(ideasList)
  .pick({
    profileId: true,
    name: true,
    description: true,
    targetAudience: true,
  })
  .extend({
    toneIds: z.array(z.uuid()).optional(),
    videoTypeIds: z.array(z.uuid()).optional(),
  })
  .meta({
    title: "Update ideas list body",
    description: "Update ideas list body description",
    ref: "UpdateIdeasListBodySchema",
  });

export type UpdateIdeasListBody = z.infer<typeof updateIdeasListBodySchema>;
