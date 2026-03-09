import { z } from "@/lib/zod";

export const deleteIdeasListParamsSchema = z
  .object({
    ideasListId: z.uuid(),
  })
  .meta({
    title: "Delete ideas list params",
    description: "Delete ideas list params description",
    ref: "DeleteIdeasListParamsSchema",
  });

export type DeleteIdeasListParams = z.infer<typeof deleteIdeasListParamsSchema>;
