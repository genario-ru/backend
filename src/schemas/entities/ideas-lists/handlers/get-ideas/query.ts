import * as z from "zod";

import { ideasListsRegistry } from "../../registry";

export const getIdeasQuerySchema = z
  .object({
    saved: z.coerce.boolean().optional(),
  })
  .register(ideasListsRegistry, {
    title: "Get ideas query",
    description: "Get ideas query description",
    ref: "GetIdeasQuerySchema",
  });

export type GetIdeasQuery = z.infer<typeof getIdeasQuerySchema>;
