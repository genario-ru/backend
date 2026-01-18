import * as z from "zod";

import { ideasRegistry } from "../../registry";

export const saveIdeaParamsSchema = z
  .object({
    ideaId: z.uuid(),
  })
  .register(ideasRegistry, {
    title: "Save idea params",
    description: "Save idea params description",
    ref: "SaveIdeaParamsSchema",
  });

export type SaveIdeaParams = z.infer<typeof saveIdeaParamsSchema>;
