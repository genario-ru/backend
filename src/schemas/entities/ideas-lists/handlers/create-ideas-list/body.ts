import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

import { ideasList } from "@/db/schema";

export const createIdeasListBodySchema = createInsertSchema(ideasList)
  .pick({
    profileId: true,
    name: true,
    description: true,
    targetAudience: true,
  })
  .extend(
    z.object({
      toneIds: z.array(z.uuid()).optional(),
      videoTypeIds: z.array(z.uuid()).optional(),
    }),
  ).shape;

export type CreateIdeasBodyParams = z.infer<typeof createIdeasListBodySchema>;
