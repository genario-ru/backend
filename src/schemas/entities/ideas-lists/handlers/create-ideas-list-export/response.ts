import { z } from "@/lib/zod";
import { ideasListExportWithUrlSchema } from "@/schemas/entities/ideas-lists/entities/ideas-list-export";

export const createIdeasListExportResponseSchema = z
  .object({
    data: ideasListExportWithUrlSchema,
  })
  .meta({
    title: "Create ideas list export response",
    description: "Create ideas list export response description",
    ref: "CreateIdeasListExportResponseSchema",
  });

export type CreateIdeasListExportResponse = z.infer<
  typeof createIdeasListExportResponseSchema
>;
