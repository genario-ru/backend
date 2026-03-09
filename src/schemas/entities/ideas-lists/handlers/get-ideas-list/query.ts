import { z } from "@/lib/zod";

export const getIdeasListQuerySchema = z
  .object({
    saved: z.coerce.boolean().optional(),
  })
  .meta({
    title: "Get ideas list query",
    description: "Get ideas list query description",
    ref: "GetIdeasListQuerySchema",
  });

export type GetIdeasListQuery = z.infer<typeof getIdeasListQuerySchema>;
