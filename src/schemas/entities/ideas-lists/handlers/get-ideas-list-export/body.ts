import { z } from "@/lib/zod";

export const getIdeasListExportBodySchema = z.object({
  format: z.enum(["pdf", "docx"]),
});

export type GetIdeasListExportBody = z.infer<
  typeof getIdeasListExportBodySchema
>;
