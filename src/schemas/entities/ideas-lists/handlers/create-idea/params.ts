import { z } from "@/lib/zod";

export const createIdeaParamsSchema = z
  .object({
    ideasListId: z.uuid(),
  })
  .meta({
    title: "Create idea params",
    description: "Create idea params description",
    ref: "CreateIdeaParamsSchema",
  });

export type CreateIdeaParams = z.infer<typeof createIdeaParamsSchema>;
