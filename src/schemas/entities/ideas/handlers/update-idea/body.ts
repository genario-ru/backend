import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import { idea } from "@/db/schema";

export const updateIdeaBodySchema = createUpdateSchema(idea)
  .pick({
    saved: true,
    liked: true,
  })
  .extend({
    name: z.string().min(3).max(256),
    description: z.string().min(16).max(4096),
    reason: z.string().min(16).max(4096).nullish(),
  })
  .meta({
    title: "Update idea body",
    description: "Update idea body description",
    ref: "UpdateIdeaBodySchema",
  });

export type UpdateIdeaBody = z.infer<typeof updateIdeaBodySchema>;
