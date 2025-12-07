import * as z from "zod";

import { ideasListsRegistry } from "../../registry";

export const updateIdeasListParamsSchema = z
  .object({
    ideasListId: z.uuid(),
  })
  .register(ideasListsRegistry, {
    title: "Update ideas list params",
    description: "Update ideas list params description",
    ref: "UpdateIdeasListParamsSchema",
  });

export type UpdateIdeasListParams = z.infer<typeof updateIdeasListParamsSchema>;
