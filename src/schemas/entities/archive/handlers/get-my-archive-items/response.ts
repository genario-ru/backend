import * as z from "zod";

import { metaResponseSchema } from "@/schemas/common/meta";

import {
  archiveEntitySchema,
  archiveItemSchema,
} from "../../entities/archive-item";
import { archiveSortSchema } from "../../entities/archive-sort";
import { archiveRegistry } from "../../registry";

export const archiveMetaResponseSchema = metaResponseSchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    entity: archiveEntitySchema.optional(),
    ideasListsTotalItems: z.number(),
    scenariosTotalItems: z.number(),
    sort: archiveSortSchema,
  });

export type ArchiveMetaResponse = z.infer<typeof archiveMetaResponseSchema>;

export const getMyArchiveItemsResponseSchema = z
  .object({
    data: z.array(archiveItemSchema),
    meta: archiveMetaResponseSchema,
  })
  .register(archiveRegistry, {
    title: "Get my archive items response",
    description: "Archive items response payload",
    ref: "GetMyArchiveItemsResponseSchema",
  });

export type GetMyArchiveItemsResponse = z.infer<
  typeof getMyArchiveItemsResponseSchema
>;
