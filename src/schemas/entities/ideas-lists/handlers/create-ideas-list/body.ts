import { createInsertSchema } from "drizzle-zod";

import { ideasList } from "@/db/schema";
import { z } from "@/lib/zod";

export const createIdeasListBodySchema = createInsertSchema(ideasList)
  .pick({
    templateId: true,
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
    title: "Create ideas list body",
    description: "Create ideas list body description",
    ref: "CreateIdeasListBodySchema",
  });

export type CreateIdeasBodyParams = z.infer<typeof createIdeasListBodySchema>;
