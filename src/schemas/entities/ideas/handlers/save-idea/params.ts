import { z } from "@/lib/zod";

export const saveIdeaParamsSchema = z
  .object({
    ideaId: z.uuid(),
  })
  .meta({
    title: "Save idea params",
    description: "Save idea params description",
    ref: "SaveIdeaParamsSchema",
  });

export type SaveIdeaParams = z.infer<typeof saveIdeaParamsSchema>;
