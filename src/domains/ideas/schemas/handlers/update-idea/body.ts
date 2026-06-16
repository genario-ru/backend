import { createUpdateSchema } from "drizzle-zod";

import { idea } from "@/db/schema";
import { z } from "@/lib/zod";

export const updateIdeaBodySchema = createUpdateSchema(idea)
  .pick({
    saved: true,
    liked: true,
  })
  .extend({
    name: z.string().min(3).max(256),
    description: z.string().min(16).max(4096),
    reason: z.string().max(4096).nullish(),
    hook: z.string().max(512).nullish(),
    complexity: z.number().int().min(0).max(5).optional(),
    potential: z.number().int().min(0).max(5).optional(),
  })
  .meta({
    title: "Update idea body",
    description: "Update idea body description",
    ref: "UpdateIdeaBodySchema",
  });

export type UpdateIdeaBody = z.infer<typeof updateIdeaBodySchema>;
