import * as z from "zod";

import { ideasListSchema } from "../../entities/ideas-list";
import { ideasListsRegistry } from "../../registry";

export const updateIdeasListResponseSchema = z
  .object({
    data: ideasListSchema,
  })
  .register(ideasListsRegistry, {
    title: "Update ideas list response",
    description: "Update ideas list response description",
    ref: "UpdateIdeasListResponseSchema",
  });

export type UpdateIdeasListResponse = z.infer<
  typeof updateIdeasListResponseSchema
>;
