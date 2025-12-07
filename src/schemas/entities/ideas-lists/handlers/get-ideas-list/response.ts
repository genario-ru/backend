import * as z from "zod";

import { ideasListExtendedSchema } from "../../entities/ideas-list";
import { ideasListsRegistry } from "../../registry";

export const getIdeasListResponseSchema = z
  .object({
    data: ideasListExtendedSchema,
  })
  .register(ideasListsRegistry, {
    title: "Get ideas list response",
    description: "Get ideas list response description",
    ref: "GetIdeasListResponseSchema",
  });

export type GetIdeasListResponse = z.infer<typeof getIdeasListResponseSchema>;
