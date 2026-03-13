import { createInsertSchema } from "drizzle-zod";

import { ideasList } from "@/db/schema";
import { z } from "@/lib/zod";

export const createIdeasListBodySchema = createInsertSchema(ideasList)
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
  })
  .meta({
    title: "Create ideas list body",
    description: "Create ideas list body description",
    ref: "CreateIdeasListBodySchema",
  });

export type CreateIdeasBodyParams = z.infer<typeof createIdeasListBodySchema>;
