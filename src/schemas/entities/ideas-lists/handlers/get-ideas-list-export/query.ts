import { z } from "@/lib/zod";

export const getIdeasListExportQuerySchema = z.object({
  format: z.enum(["pdf", "docx"]),
});

export type GetIdeasListExportQuery = z.infer<
  typeof getIdeasListExportQuerySchema
>;
