import * as z from "zod";

import { ideasRegistry } from "../../registry";

export const deleteIdeaParamsSchema = z
  .object({
    ideaId: z.uuid(),
  })
  .register(ideasRegistry, {
    title: "Delete idea params",
    description: "Delete idea params description",
    ref: "DeleteIdeaParamsSchema",
  });

export type DeleteIdeaParams = z.infer<typeof deleteIdeaParamsSchema>;
