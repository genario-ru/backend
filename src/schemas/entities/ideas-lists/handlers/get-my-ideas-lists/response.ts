import * as z from "zod";

import { metaResponseSchema } from "@/schemas/common/meta";

import { ideasListExtendedSchema } from "../../entities/ideas-list";

export const getMyIdeasListsResponseSchema = z.object({
  data: z.array(ideasListExtendedSchema),
  meta: metaResponseSchema.extend(
    z.object({
      profileId: z.uuid().optional(),
      sortBy: z.enum(["createdAt", "updatedAt"]),
    }).shape,
  ),
});

export type GetMyIdeasListsResponse = z.infer<
  typeof getMyIdeasListsResponseSchema
>;
