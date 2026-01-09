import * as z from "zod";

import { metaQuerySchema } from "@/schemas/common/meta";

import { archiveRegistry } from "../../registry";

export const getMyArchiveItemsQuerySchema = metaQuerySchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    sort: z.string().optional(),
    entity: z.string().optional(),
    templateIds: z.union([z.array(z.string()), z.string()]).optional(),
    profileIds: z.union([z.array(z.string()), z.string()]).optional(),
    toneIds: z.union([z.array(z.string()), z.string()]).optional(),
    videoTypeIds: z.union([z.array(z.string()), z.string()]).optional(),
    platformIds: z.union([z.array(z.string()), z.string()]).optional(),
    videoDurationIds: z.union([z.array(z.string()), z.string()]).optional(),
  })
  .register(archiveRegistry, {
    title: "Get my archive items query",
    description: "Query parameters for getting archive items",
    ref: "GetMyArchiveItemsQuerySchema",
  });

export type GetMyArchiveItemsQuery = z.infer<
  typeof getMyArchiveItemsQuerySchema
>;
