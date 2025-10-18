import * as z from "zod";

export const getIdeasListParamsSchema = z.object({
  ideasListId: z.uuid(),
});

export type GetIdeasListParams = z.infer<typeof getIdeasListParamsSchema>;
