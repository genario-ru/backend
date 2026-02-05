import * as z from "zod";

import { ideasRegistry } from "../../registry";

export const getIdeaParamsSchema = z
  .object({
    ideaId: z.uuid(),
  })
  .register(ideasRegistry, {
    title: "Get idea params",
    description: "Get idea params description",
    ref: "GetIdeaParamsSchema",
  });

export type GetIdeaParams = z.infer<typeof getIdeaParamsSchema>;
