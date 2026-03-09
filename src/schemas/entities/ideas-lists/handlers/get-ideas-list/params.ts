import { z } from "@/lib/zod";

export const getIdeasListParamsSchema = z.object({
  ideasListId: z.uuid(),
});

export type GetIdeasListParams = z.infer<typeof getIdeasListParamsSchema>;
