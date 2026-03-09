import { z } from "@/lib/zod";
import { queryMetaSchema } from "@/schemas/common/meta";

export const getMyIdeasListsQuerySchema = queryMetaSchema
  .extend({
    profileId: z.uuid().optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
  })
  .meta({
    title: "Get my ideas lists query",
    description: "Get my ideas lists query description",
    ref: "GetMyIdeasListsQuerySchema",
  });

export type GetMyIdeasListsQuery = z.infer<typeof getMyIdeasListsQuerySchema>;
