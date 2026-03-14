import { z } from "@/lib/zod";

export const getIdeasListExportsParamsSchema = z.object({
  ideasListId: z.uuid(),
});

export type GetIdeasListExportsParams = z.infer<
  typeof getIdeasListExportsParamsSchema
>;
