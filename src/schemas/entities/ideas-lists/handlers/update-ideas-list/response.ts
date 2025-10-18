import * as z from "zod";

import { ideasListSchema } from "../../entities/ideas-list";

export const updateIdeasListResponseSchema = z.object({
  data: ideasListSchema,
});

export type UpdateIdeasListResponse = z.infer<
  typeof updateIdeasListResponseSchema
>;
