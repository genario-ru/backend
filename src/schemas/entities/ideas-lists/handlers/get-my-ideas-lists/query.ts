import { z } from "@/lib/zod";
import { metaQuerySchema } from "@/schemas/common/meta";

import { ideasListsRegistry } from "../../registry";

export const getMyIdeasListsQuerySchema = metaQuerySchema
  .extend({
    profileId: z.uuid().optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
  })
  .register(ideasListsRegistry, {
    title: "Get my ideas lists query",
    description: "Get my ideas lists query description",
    ref: "GetMyIdeasListsQuerySchema",
  });

export type GetMyIdeasListsQuery = z.infer<typeof getMyIdeasListsQuerySchema>;
