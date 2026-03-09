import { z } from "@/lib/zod";
import { metaResponseSchema } from "@/schemas/common/meta";

import { ideasListExtendedSchema } from "../../entities/ideas-list";
import { ideasListsRegistry } from "../../registry";

export const getMyIdeasListsResponseSchema = z
  .object({
    data: z.array(ideasListExtendedSchema),
    meta: metaResponseSchema.extend({
      profileId: z.uuid().optional(),
      sortBy: z.enum(["createdAt", "updatedAt"]),
    }),
  })
  .register(ideasListsRegistry, {
    title: "Get my ideas lists response",
    description: "Get my ideas lists response description",
    ref: "GetMyIdeasListsResponseSchema",
  });

export type GetMyIdeasListsResponse = z.infer<
  typeof getMyIdeasListsResponseSchema
>;
