import { z } from "@/lib/zod";

export const createIdeaParamsSchema = z.object({
  ideasListId: z.uuid(),
});

export type CreateIdeaParams = z.infer<typeof createIdeaParamsSchema>;
