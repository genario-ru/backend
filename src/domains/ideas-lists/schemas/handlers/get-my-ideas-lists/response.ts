import { ideasListExtendedSchema } from "@/domains/ideas-lists/schemas/entities/ideas-list";
import { z } from "@/lib/zod";
import { responseMetaSchema } from "@/shared/schemas/common/meta";

export const getMyIdeasListsResponseMetaSchema = responseMetaSchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    sort: z.string(),
  })
  .meta({
    title: "Get my ideas lists response meta",
    description: "Get my ideas lists response meta description",
    ref: "GetMyIdeasListsResponseMetaSchema",
  });

export type GetMyIdeasListsResponseMeta = z.infer<
  typeof getMyIdeasListsResponseMetaSchema
>;

export const getMyIdeasListsResponseSchema = z
  .object({
    data: z.array(ideasListExtendedSchema),
    meta: getMyIdeasListsResponseMetaSchema,
  })
  .meta({
    title: "Get my ideas lists response",
    description: "Ideas lists response payload",
    ref: "GetMyIdeasListsResponseSchema",
  });

export type GetMyIdeasListsResponse = z.infer<
  typeof getMyIdeasListsResponseSchema
>;
