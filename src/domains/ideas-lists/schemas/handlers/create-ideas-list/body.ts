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
    prompt: z.string().min(3).max(4096),
    toneIds: z.array(z.uuid()).nullish(),
    videoTypeIds: z.array(z.uuid()).min(1),
  })
  .meta({
    title: "Create ideas list body",
    description: "Create ideas list body description",
    ref: "CreateIdeasListBodySchema",
  });

export type CreateIdeasBodyParams = z.infer<typeof createIdeasListBodySchema>;
