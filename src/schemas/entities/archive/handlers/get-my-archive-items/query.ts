import * as z from "zod";

import { metaQuerySchema } from "@/schemas/common/meta";

import { archiveEntitySchema } from "../../entities/archive-item";
import { archiveSortSchema } from "../../entities/archive-sort";
import { archiveRegistry } from "../../registry";

export const getMyArchiveItemsQuerySchema = metaQuerySchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    entity: archiveEntitySchema.optional(),
    templateIds: z.array(z.string().uuid()).optional(),
    profileIds: z.array(z.string().uuid()).optional(),
    toneIds: z.array(z.string().uuid()).optional(),
    videoTypeIds: z.array(z.string().uuid()).optional(),
    platformIds: z.array(z.string().uuid()).optional(),
    videoDurationIds: z.array(z.string().uuid()).optional(),
    sort: archiveSortSchema.optional(),
  })
  .register(archiveRegistry, {
    title: "Get my archive items query",
    description: "Query parameters for getting archive items",
    ref: "GetMyArchiveItemsQuerySchema",
  });

export type GetMyArchiveItemsQuery = z.infer<
  typeof getMyArchiveItemsQuerySchema
>;
