import * as z from "zod";

import { metaQuerySchema } from "@/schemas/common/meta";

export const getMyIdeasListsQuerySchema = metaQuerySchema.extend(
  z.object({
    profileId: z.uuid().optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
  }).shape,
);

export type GetMyIdeasListsQuery = z.infer<typeof getMyIdeasListsQuerySchema>;
