import * as z from "zod";

import { ideasRegistry } from "../../registry";

export const updateIdeaParamsSchema = z
  .object({
    ideaId: z.uuid(),
  })
  .register(ideasRegistry, {
    title: "Update idea params",
    description: "Update idea params description",
    ref: "UpdateIdeaParamsSchema",
  });

export type UpdateIdeaParams = z.infer<typeof updateIdeaParamsSchema>;
