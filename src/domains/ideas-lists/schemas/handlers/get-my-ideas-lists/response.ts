import { z } from "@/lib/zod";
import { responseMetaSchema } from "@/shared/schemas/common/meta";

import { ideasListExtendedSchema } from "../../entities/ideas-list";

export const getMyIdeasListResponseMetaSchema = responseMetaSchema
  .extend({
    profileId: z.uuid().optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]),
  })
  .meta({
    title: "Get my ideas list response meta",
    description: "Get my ideas list response meta description",
    ref: "GetMyIdeasListResponseMetaSchema",
  });

export type GetMyIdeasListsResponseMeta = z.infer<
  typeof getMyIdeasListResponseMetaSchema
>;

export const getMyIdeasListsResponseSchema = z
  .object({
    data: z.array(ideasListExtendedSchema),
    meta: getMyIdeasListResponseMetaSchema,
  })
  .meta({
    title: "Get my ideas lists response",
    description: "Get my ideas lists response description",
    ref: "GetMyIdeasListsResponseSchema",
  });

export type GetMyIdeasListsResponse = z.infer<
  typeof getMyIdeasListsResponseSchema
>;
