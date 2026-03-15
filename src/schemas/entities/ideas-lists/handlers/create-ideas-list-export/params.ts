import { z } from "@/lib/zod";

export const cerateIdeasListExportParamsSchema = z.object({
  ideasListId: z.uuid(),
});

export type CreateIdeasListExportParams = z.infer<
  typeof cerateIdeasListExportParamsSchema
>;
