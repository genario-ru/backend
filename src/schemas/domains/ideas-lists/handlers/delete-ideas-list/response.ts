import { z } from "@/lib/zod";

import { ideasListSchema } from "../../entities/ideas-list";
export const deleteIdeasListResponseSchema = z
  .object({
    data: ideasListSchema,
  })
  .meta({
    title: "Delete ideas list response",
    description: "Delete ideas list response description",
    ref: "DeleteIdeasListResponseSchema",
  });

export type DeleteIdeasListResponse = z.infer<
  typeof deleteIdeasListResponseSchema
>;
