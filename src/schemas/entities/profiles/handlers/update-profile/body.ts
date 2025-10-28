import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import { profile } from "@/db/schema";

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
  });

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
