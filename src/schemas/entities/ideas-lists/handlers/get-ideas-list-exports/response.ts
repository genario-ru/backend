import { z } from "@/lib/zod";
import { generationStatusSchema } from "@/schemas/common/generation-status";

export const ideasListExportItemSchema = z
  .object({
    name: z.string(),
    format: z.enum(["pdf", "docx"]),
    status: generationStatusSchema,
    url: z.string().nullable(),
  })
  .meta({
    title: "Ideas list export item",
    description: "Ideas list export item description",
    ref: "IdeasListExportItemSchema",
  });

export type IdeasListExportItem = z.infer<typeof ideasListExportItemSchema>;

export const getIdeasListExportsResponseSchema = z
  .object({
    data: z.array(ideasListExportItemSchema),
  })
  .meta({
    title: "Get ideas list exports response",
    description: "Get ideas list exports response description",
    ref: "GetIdeasListExportsResponseSchema",
  });

export type GetIdeasListExportsResponse = z.infer<
  typeof getIdeasListExportsResponseSchema
>;
