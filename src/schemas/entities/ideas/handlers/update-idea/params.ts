import { z } from "@/lib/zod";

export const updateIdeaParamsSchema = z.object({
  ideaId: z.uuid(),
});

export type UpdateIdeaParams = z.infer<typeof updateIdeaParamsSchema>;
