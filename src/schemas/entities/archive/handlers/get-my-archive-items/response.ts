import { z } from "@/lib/zod";
import { metaResponseSchema } from "@/schemas/common/meta";

import { archiveItemSchema } from "../../entities/archive-item";
export const archiveMetaResponseSchema = metaResponseSchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    entity: z.string().optional(),
    ideasListsTotalItems: z.number(),
    scenariosTotalItems: z.number(),
    sort: z.string(),
  });

export type ArchiveMetaResponse = z.infer<typeof archiveMetaResponseSchema>;

export const getMyArchiveItemsResponseSchema = z
  .object({
    data: z.array(archiveItemSchema),
    meta: archiveMetaResponseSchema,
  })
  .meta({
    title: "Get my archive items response",
    description: "Archive items response payload",
    ref: "GetMyArchiveItemsResponseSchema",
  });

export type GetMyArchiveItemsResponse = z.infer<
  typeof getMyArchiveItemsResponseSchema
>;
