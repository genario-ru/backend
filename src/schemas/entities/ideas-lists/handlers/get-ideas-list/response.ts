import { z } from "@/lib/zod";
import { ideaSchema } from "@/schemas/entities/ideas/entities/idea";

import { ideasListExtendedSchema } from "../../entities/ideas-list";
import { ideasListsRegistry } from "../../registry";

export const getIdeasListResponseSchema = z
  .object({
    data: ideasListExtendedSchema.extend({
      ideas: z.array(ideaSchema),
    }),
  })
  .register(ideasListsRegistry, {
    title: "Get ideas list response",
    description: "Get ideas list response description",
    ref: "GetIdeasListResponseSchema",
  });

export type GetIdeasListResponse = z.infer<typeof getIdeasListResponseSchema>;
