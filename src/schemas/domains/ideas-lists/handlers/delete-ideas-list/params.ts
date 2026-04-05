import { z } from "@/lib/zod";

export const deleteIdeasListParamsSchema = z.object({
  ideasListId: z.uuid(),
});

export type DeleteIdeasListParams = z.infer<typeof deleteIdeasListParamsSchema>;
