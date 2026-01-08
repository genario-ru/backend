import * as z from "zod";

import { metaQuerySchema } from "@/schemas/common/meta";

import { archiveRegistry } from "../../registry";

export const getMyArchiveItemsQuerySchema = metaQuerySchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    entity: z.string().optional(),
    templateIds: z.array(z.string()).optional(),
    profileIds: z.array(z.string()).optional(),
    toneIds: z.array(z.string()).optional(),
    videoTypeIds: z.array(z.string()).optional(),
    platformIds: z.array(z.string()).optional(),
    videoDurationIds: z.array(z.string()).optional(),
    sort: z.string().optional(),
  })
  .register(archiveRegistry, {
    title: "Get my archive items query",
    description: "Query parameters for getting archive items",
    ref: "GetMyArchiveItemsQuerySchema",
  });

export type GetMyArchiveItemsQuery = z.infer<
  typeof getMyArchiveItemsQuerySchema
>;
