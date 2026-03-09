import { z } from "@/lib/zod";

import { ideasListSchema } from "../../entities/ideas-list";
export const updateIdeasListResponseSchema = z
  .object({
    data: ideasListSchema,
  })
  .meta({
    title: "Update ideas list response",
    description: "Update ideas list response description",
    ref: "UpdateIdeasListResponseSchema",
  });

export type UpdateIdeasListResponse = z.infer<
  typeof updateIdeasListResponseSchema
>;
