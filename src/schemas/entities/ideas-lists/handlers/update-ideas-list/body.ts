import { createUpdateSchema } from "drizzle-zod";

import { ideasList } from "@/db/schema";
import { z } from "@/lib/zod";

import { ideasListsRegistry } from "../../registry";

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
  .register(ideasListsRegistry, {
    title: "Update ideas list body",
    description: "Update ideas list body description",
    ref: "UpdateIdeasListBodySchema",
  });

export type UpdateIdeasListBody = z.infer<typeof updateIdeasListBodySchema>;
