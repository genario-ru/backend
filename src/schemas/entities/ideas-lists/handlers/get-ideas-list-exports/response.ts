import { z } from "@/lib/zod";
import { exportDocumentShortSchema } from "@/schemas/entities/export-document/entities/export-document";

export const getIdeasListExportsResponseSchema = z
  .object({
    data: z.array(exportDocumentShortSchema),
  })
  .meta({
    title: "Get ideas list exports response",
    description: "Get ideas list exports response description",
    ref: "GetIdeasListExportsResponseSchema",
  });

export type GetIdeasListExportsResponse = z.infer<
  typeof getIdeasListExportsResponseSchema
>;
