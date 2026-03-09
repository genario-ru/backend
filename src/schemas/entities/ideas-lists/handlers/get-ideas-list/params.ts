import { z } from "@/lib/zod";

import { ideasListsRegistry } from "../../registry";

export const getIdeasListParamsSchema = z
  .object({
    ideasListId: z.uuid(),
  })
  .register(ideasListsRegistry, {
    title: "Get ideas list params",
    description: "Get ideas list params description",
    ref: "GetIdeasListParamsSchema",
  });

export type GetIdeasListParams = z.infer<typeof getIdeasListParamsSchema>;
