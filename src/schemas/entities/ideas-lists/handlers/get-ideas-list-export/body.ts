import { z } from "@/lib/zod";

export const getIdeasListExportBodySchema = z.object({
  format: z.enum(["pdf", "docx"]),
  saved: z.boolean(),
});

export type GetIdeasListExportBody = z.infer<
  typeof getIdeasListExportBodySchema
>;
