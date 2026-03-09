import { z } from "@/lib/zod";

export const getIdeaParamsSchema = z
  .object({
    ideaId: z.uuid(),
  })
  .meta({
    title: "Get idea params",
    description: "Get idea params description",
    ref: "GetIdeaParamsSchema",
  });

export type GetIdeaParams = z.infer<typeof getIdeaParamsSchema>;
