import { z } from "@/lib/zod";

import { ideasListsRegistry } from "../../registry";

export const getIdeasListQuerySchema = z
  .object({
    saved: z.coerce.boolean().optional(),
  })
  .register(ideasListsRegistry, {
    title: "Get ideas list query",
    description: "Get ideas list query description",
    ref: "GetIdeasListQuerySchema",
  });

export type GetIdeasListQuery = z.infer<typeof getIdeasListQuerySchema>;
