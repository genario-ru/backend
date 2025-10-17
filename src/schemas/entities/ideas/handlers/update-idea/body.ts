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
  .extend(
    z.object({
      ideaId: z.uuid(),
    }).shape,
  );

export type UpdateIdeaBody = z.infer<typeof updateIdeaBodySchema>;
