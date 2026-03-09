import { z } from "@/lib/zod";
import { queryMetaSchema } from "@/schemas/common/meta";

export const getMyArchiveItemsQuerySchema = queryMetaSchema
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
  .meta({
    title: "Get my archive items query",
    description: "Query parameters for getting archive items",
    ref: "GetMyArchiveItemsQuerySchema",
  });

export type GetMyArchiveItemsQuery = z.infer<
  typeof getMyArchiveItemsQuerySchema
>;
