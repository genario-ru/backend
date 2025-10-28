import { createUpdateSchema } from "drizzle-zod";
import * as z from "zod";

import { ideasList } from "@/db/schema";

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
  });

export type UpdateIdeasListBody = z.infer<typeof updateIdeasListBodySchema>;
