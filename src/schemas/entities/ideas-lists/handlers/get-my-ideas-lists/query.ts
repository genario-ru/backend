import * as z from "zod";

import { metaQuerySchema } from "@/schemas/common/meta";

export const getMyIdeasListsQuerySchema = metaQuerySchema.extend({
  profileId: z.uuid().optional(),
  sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
});

export type GetMyIdeasListsQuery = z.infer<typeof getMyIdeasListsQuerySchema>;
