import { z } from "@/lib/zod";

export const saveIdeaParamsSchema = z.object({
  ideaId: z.uuid(),
});

export type SaveIdeaParams = z.infer<typeof saveIdeaParamsSchema>;
