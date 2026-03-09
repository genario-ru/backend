import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import { idea } from "@/db/schema";

export const updateIdeaBodySchema = createUpdateSchema(idea)
  .pick({
    name: true,
    description: true,
    saved: true,
    liked: true,
  })
  .meta({
    title: "Update idea body",
    description: "Update idea body description",
    ref: "UpdateIdeaBodySchema",
  });

export type UpdateIdeaBody = z.infer<typeof updateIdeaBodySchema>;
