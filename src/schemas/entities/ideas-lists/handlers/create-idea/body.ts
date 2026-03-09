import { createInsertSchema } from "drizzle-zod";

import { idea } from "@/db/schema";
import { z } from "@/lib/zod";

export const createIdeaBodySchema = createInsertSchema(idea)
  .pick({
    videoTypeId: true,
    name: true,
    description: true,
  })
  .meta({
    title: "Create idea body",
    description: "Create idea body description",
    ref: "CreateIdeaBodySchema",
  });

export type CreateIdeaBody = z.infer<typeof createIdeaBodySchema>;
