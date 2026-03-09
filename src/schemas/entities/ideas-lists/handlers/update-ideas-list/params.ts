import { z } from "@/lib/zod";

export const updateIdeasListParamsSchema = z
  .object({
    ideasListId: z.uuid(),
  })
  .meta({
    title: "Update ideas list params",
    description: "Update ideas list params description",
    ref: "UpdateIdeasListParamsSchema",
  });

export type UpdateIdeasListParams = z.infer<typeof updateIdeasListParamsSchema>;
