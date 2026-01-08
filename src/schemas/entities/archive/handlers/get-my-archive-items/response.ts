import * as z from "zod";

import { ARCHIVE_SORT_VALUES } from "@/constants/entities/archive/sort";
import { metaResponseSchema } from "@/schemas/common/meta";

import {
  archiveEntitySchema,
  archiveItemSchema,
} from "../../entities/archive-item";
import { archiveRegistry } from "../../registry";

export const archiveMetaResponseSchema = metaResponseSchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    entity: archiveEntitySchema.optional(),
    ideasListsTotalItems: z.number(),
    scenariosTotalItems: z.number(),
    sort: z.enum(ARCHIVE_SORT_VALUES),
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
