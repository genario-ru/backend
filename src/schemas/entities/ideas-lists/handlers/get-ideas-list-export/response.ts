import { z } from "@/lib/zod";
import { generationStatusSchema } from "@/schemas/common/generation-status";

export const ideasListExportResponseItemSchema = z
  .object({
    name: z.string(),
    format: z.enum(["pdf", "docx"]),
    status: generationStatusSchema,
    url: z.string().nullable(),
  })
  .meta({
    title: "Ideas list export response item",
    description: "Ideas list export response item description",
    ref: "IdeasListExportResponseItemSchema",
  });

export type IdeasListExportResponseItem = z.infer<
  typeof ideasListExportResponseItemSchema
>;

export const getIdeasListExportResponseSchema = z
  .object({
    data: ideasListExportResponseItemSchema,
  })
  .meta({
    title: "Get ideas list export response",
    description: "Get ideas list export response description",
    ref: "GetIdeasListExportResponseSchema",
  });

export type GetIdeasListExportResponse = z.infer<
  typeof getIdeasListExportResponseSchema
>;
