import { z } from "@/lib/zod";

export const getIdeasListExportsQuerySchema = z.object({
  savedOnly: z.boolean().optional().default(false),
});

export type GetIdeasListExportsQuery = z.infer<
  typeof getIdeasListExportsQuerySchema
>;
