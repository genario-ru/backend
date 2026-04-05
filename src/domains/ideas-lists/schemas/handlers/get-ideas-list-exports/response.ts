import { exportDocumentShortSchema } from "@/domains/export-document/schemas/entities/export-document";
import { z } from "@/lib/zod";

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
