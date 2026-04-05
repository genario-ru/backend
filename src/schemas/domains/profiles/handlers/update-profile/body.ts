import { createUpdateSchema } from "drizzle-zod";

import { profile } from "@/db/schema";
import { z } from "@/lib/zod";

export const updateProfileBodySchema = createUpdateSchema(profile)
  .pick({
    name: true,
    description: true,
    targetAudience: true,
    typeId: true,
  })
  .extend({
    platformIds: z.array(z.uuid()).optional(),
    toneIds: z.array(z.uuid()).optional(),
  })
  .meta({
    title: "Update profile body",
    description: "Update profile body description",
    ref: "UpdateProfileBodySchema",
  });

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
