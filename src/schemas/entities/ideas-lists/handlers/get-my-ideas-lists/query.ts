import { z } from "@/lib/zod";
import { queryMetaSchema } from "@/schemas/shared/common/meta";

export const getMyIdeasListsQuerySchema = queryMetaSchema.extend({
  profileId: z.uuid().optional(),
  sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
});

export type GetMyIdeasListsQuery = z.infer<typeof getMyIdeasListsQuerySchema>;
