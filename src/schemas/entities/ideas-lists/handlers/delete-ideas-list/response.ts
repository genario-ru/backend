import * as z from "zod";

import { ideasListSchema } from "../../entities/ideas-list";
import { ideasListsRegistry } from "../../registry";

export const deleteIdeasListResponseSchema = z
  .object({
    data: ideasListSchema,
  })
  .register(ideasListsRegistry, {
    title: "Delete ideas list response",
    description: "Delete ideas list response description",
    ref: "DeleteIdeasListResponseSchema",
  });

export type DeleteIdeasListResponse = z.infer<
  typeof deleteIdeasListResponseSchema
>;
