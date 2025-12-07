import * as z from "zod";

import { ideasListsRegistry } from "../../registry";

export const deleteIdeasListParamsSchema = z
  .object({
    ideasListId: z.uuid(),
  })
  .register(ideasListsRegistry, {
    title: "Delete ideas list params",
    description: "Delete ideas list params description",
    ref: "DeleteIdeasListParamsSchema",
  });

export type DeleteIdeasListParams = z.infer<typeof deleteIdeasListParamsSchema>;
