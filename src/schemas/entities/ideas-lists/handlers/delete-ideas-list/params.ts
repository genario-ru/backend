import * as z from "zod";

export const deleteIdeasListParamsSchema = z.object({
  ideasListId: z.uuid(),
});

export type DeleteIdeasListParams = z.infer<typeof deleteIdeasListParamsSchema>;
