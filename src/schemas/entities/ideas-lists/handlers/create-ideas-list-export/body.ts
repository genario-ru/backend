import { z } from "@/lib/zod";

export const createIdeasListExportBodySchema = z
  .object({
    format: z.string(),
    savedOnly: z.boolean().optional().default(false),
  })
  .meta({
    title: "Create ideas list export body",
    description: "Create ideas list export body description",
    ref: "CreateIdeasListExportBodySchema",
  });

export type CreateIdeasListExportBody = z.infer<
  typeof createIdeasListExportBodySchema
>;
