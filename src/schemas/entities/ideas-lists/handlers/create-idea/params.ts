import * as z from "zod";

import { ideasListsRegistry } from "../../registry";

export const createIdeaParamsSchema = z
  .object({
    ideasListId: z.uuid(),
  })
  .register(ideasListsRegistry, {
    title: "Create idea params",
    description: "Create idea params description",
    ref: "CreateIdeaParamsSchema",
  });

export type CreateIdeaParams = z.infer<typeof createIdeaParamsSchema>;
