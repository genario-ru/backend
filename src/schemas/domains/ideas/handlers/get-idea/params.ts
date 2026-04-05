import { z } from "@/lib/zod";

export const getIdeaParamsSchema = z.object({
  ideaId: z.uuid(),
});

export type GetIdeaParams = z.infer<typeof getIdeaParamsSchema>;
