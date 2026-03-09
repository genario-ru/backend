import { z } from "@/lib/zod";

export const deleteIdeaParamsSchema = z.object({
  ideaId: z.uuid(),
});

export type DeleteIdeaParams = z.infer<typeof deleteIdeaParamsSchema>;
