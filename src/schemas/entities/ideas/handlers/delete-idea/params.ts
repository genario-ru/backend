import { z } from "@/lib/zod";

export const deleteIdeaParamsSchema = z
  .object({
    ideaId: z.uuid(),
  })
  .meta({
    title: "Delete idea params",
    description: "Delete idea params description",
    ref: "DeleteIdeaParamsSchema",
  });

export type DeleteIdeaParams = z.infer<typeof deleteIdeaParamsSchema>;
