import * as z from "zod";

import { ideasListsRegistry } from "../../registry";

export const getIdeasParamsSchema = z
  .object({
    ideasListId: z.uuid(),
  })
  .register(ideasListsRegistry, {
    title: "Get ideas params",
    description: "Get ideas params description",
    ref: "GetIdeasParamsSchema",
  });

export type GetIdeasParams = z.infer<typeof getIdeasParamsSchema>;
