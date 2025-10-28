import * as z from "zod";

export const getIdeasQuerySchema = z.object({
  saved: z.coerce.boolean().optional(),
});

export type GetIdeasQuery = z.infer<typeof getIdeasQuerySchema>;

