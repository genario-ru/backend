import * as z from "zod";

export const updateIdeasListParamsSchema = z.object({
  ideasListId: z.uuid(),
});

export type UpdateIdeasListParams = z.infer<typeof updateIdeasListParamsSchema>;
