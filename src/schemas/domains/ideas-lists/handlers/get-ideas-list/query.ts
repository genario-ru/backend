import { z } from "@/lib/zod";

export const getIdeasListQuerySchema = z.object({
  saved: z.coerce.boolean().optional(),
});

export type GetIdeasListQuery = z.infer<typeof getIdeasListQuerySchema>;
