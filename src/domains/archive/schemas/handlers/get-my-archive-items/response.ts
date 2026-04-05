import { z } from "@/lib/zod";
import { responseMetaSchema } from "@/shared/schemas/common/meta";

import { archiveItemSchema } from "../../entities/archive-item";

export const getMyArchiveItemsResponseMetaSchema = responseMetaSchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    entity: z.string().optional(),
    ideasListsTotalItems: z.number(),
    scenariosTotalItems: z.number(),
    sort: z.string(),
  })
  .meta({
    title: "Get my archive items response meta",
    description: "Get my archive items response meta description",
    ref: "GetMyArchiveItemsResponseMetaSchema",
  });

export type GetMyArchiveItemsResponseMeta = z.infer<
  typeof getMyArchiveItemsResponseMetaSchema
>;

export const getMyArchiveItemsResponseSchema = z
  .object({
    data: z.array(archiveItemSchema),
    meta: getMyArchiveItemsResponseMetaSchema,
  })
  .meta({
    title: "Get my archive items response",
    description: "Archive items response payload",
    ref: "GetMyArchiveItemsResponseSchema",
  });

export type GetMyArchiveItemsResponse = z.infer<
  typeof getMyArchiveItemsResponseSchema
>;
