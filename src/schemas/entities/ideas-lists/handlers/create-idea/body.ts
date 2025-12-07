import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

import { idea } from "@/db/schema";

import { ideasListsRegistry } from "../../registry";

export const createIdeaBodySchema = createInsertSchema(idea)
  .pick({
    videoTypeId: true,
    name: true,
    description: true,
  })
  .register(ideasListsRegistry, {
    title: "Create idea body",
    description: "Create idea body description",
    ref: "CreateIdeaBodySchema",
  });

export type CreateIdeaBody = z.infer<typeof createIdeaBodySchema>;
