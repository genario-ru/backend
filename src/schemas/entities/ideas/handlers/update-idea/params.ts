import { z } from "@/lib/zod";

export const updateIdeaParamsSchema = z
  .object({
    ideaId: z.uuid(),
  })
  .meta({
    title: "Update idea params",
    description: "Update idea params description",
    ref: "UpdateIdeaParamsSchema",
  });

export type UpdateIdeaParams = z.infer<typeof updateIdeaParamsSchema>;
