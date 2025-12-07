import * as z from "zod";

import { ideasListSchema } from "../../entities/ideas-list";
import { ideasListsRegistry } from "../../registry";

export const createIdeasListResponseSchema = z
  .object({
    data: ideasListSchema,
  })
  .register(ideasListsRegistry, {
    title: "Create ideas list response",
    description: "Create ideas list response description",
    ref: "CreateIdeasListResponseSchema",
  });

export type CreateIdeasListResponse = z.infer<
  typeof createIdeasListResponseSchema
>;
