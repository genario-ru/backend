import * as z from "zod";

export const getIdeasParamsSchema = z.object({
  ideasListId: z.uuid(),
});

export type GetIdeasParams = z.infer<typeof getIdeasParamsSchema>;
