import { z } from "@/lib/zod";

export const createIdeasListExportParamsSchema = z.object({
  ideasListId: z.uuid(),
});

export type CreateIdeasListExportParams = z.infer<
  typeof createIdeasListExportParamsSchema
>;
