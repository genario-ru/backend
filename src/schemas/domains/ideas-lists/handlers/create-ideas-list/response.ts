import { z } from "@/lib/zod";

import { ideasListSchema } from "../../entities/ideas-list";
export const createIdeasListResponseSchema = z
  .object({
    data: ideasListSchema,
  })
  .meta({
    title: "Create ideas list response",
    description: "Create ideas list response description",
    ref: "CreateIdeasListResponseSchema",
  });

export type CreateIdeasListResponse = z.infer<
  typeof createIdeasListResponseSchema
>;
