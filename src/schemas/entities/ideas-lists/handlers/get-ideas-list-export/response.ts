import { z } from "@/lib/zod";
import { ideasListExportWithUrlSchema } from "@/schemas/entities/ideas-lists/entities/ideas-list-export";

export const getIdeasListExportResponseSchema = z
  .object({
    data: ideasListExportWithUrlSchema,
  })
  .meta({
    title: "Get ideas list export response",
    description: "Get ideas list export response description",
    ref: "GetIdeasListExportResponseSchema",
  });

export type GetIdeasListExportResponse = z.infer<
  typeof getIdeasListExportResponseSchema
>;
