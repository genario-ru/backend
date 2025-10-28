import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

import { idea } from "@/db/schema";

export const createIdeaBodySchema = createInsertSchema(idea).pick({
  videoTypeId: true,
  name: true,
  description: true,
});

export type CreateIdeaBody = z.infer<typeof createIdeaBodySchema>;

