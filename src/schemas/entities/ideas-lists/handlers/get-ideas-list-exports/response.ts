import { generationStatus } from "@/db/schema";
import { z } from "@/lib/zod";

export const ideasListExportItemSchema = z
  .object({
    name: z.string(),
    format: z.enum(["pdf", "docx"]),
    state: generationStatus,
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
