import { z } from "@/lib/zod";

export const getIdeasListParamsSchema = z
  .object({
    ideasListId: z.uuid(),
  })
  .meta({
    title: "Get ideas list params",
    description: "Get ideas list params description",
    ref: "GetIdeasListParamsSchema",
  });

export type GetIdeasListParams = z.infer<typeof getIdeasListParamsSchema>;
