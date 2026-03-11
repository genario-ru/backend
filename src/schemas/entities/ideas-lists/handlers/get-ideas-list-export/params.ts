import { z } from "@/lib/zod";

export const getIdeasListExportParamsSchema = z.object({
  ideasListId: z.uuid(),
  exportId: z.uuid(),
});

export type GetIdeasListExportParams = z.infer<
  typeof getIdeasListExportParamsSchema
>;
