import { createInsertSchema } from "drizzle-zod";

import { idea } from "@/db/schema";
import { z } from "@/lib/zod";

export const createIdeaBodySchema = createInsertSchema(idea)
  .pick({
    videoTypeId: true,
  })
  .extend({
    name: z.string().min(3).max(256),
    description: z.string().min(16).max(4096),
    reason: z.string().max(4096).nullish(),
  })
  .meta({
    title: "Create idea body",
    description: "Create idea body description",
    ref: "CreateIdeaBodySchema",
  });

export type CreateIdeaBody = z.infer<typeof createIdeaBodySchema>;
