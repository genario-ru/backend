import { z } from "@/lib/zod";
import { queryMetaSchema } from "@/shared/schemas/common/meta";

export const getMyIdeasListsQuerySchema = queryMetaSchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    sort: z.string().optional(),
    templateIds: z.union([z.array(z.string()), z.string()]).optional(),
    profileIds: z.union([z.array(z.string()), z.string()]).optional(),
    toneIds: z.union([z.array(z.string()), z.string()]).optional(),
    videoTypeIds: z.union([z.array(z.string()), z.string()]).optional(),
  });

export type GetMyIdeasListsQuery = z.infer<typeof getMyIdeasListsQuerySchema>;
