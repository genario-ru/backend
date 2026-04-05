import { ideaSchema } from "@/domains/ideas/schemas/entities/idea";
import { z } from "@/lib/zod";

import { ideasListExtendedSchema } from "../../entities/ideas-list";

export const getIdeasListResponseSchema = z
  .object({
    data: ideasListExtendedSchema.extend({
      ideas: z.array(ideaSchema),
    }),
  })
  .meta({
    title: "Get ideas list response",
    description: "Get ideas list response description",
    ref: "GetIdeasListResponseSchema",
  });

export type GetIdeasListResponse = z.infer<typeof getIdeasListResponseSchema>;
