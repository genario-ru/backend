import * as z from "zod";

import { ideasListSchema } from "../../entities/ideas-list";

export const createIdeasListResponseSchema = z.object({
  data: ideasListSchema,
});

export type CreateIdeasListResponse = z.infer<
  typeof createIdeasListResponseSchema
>;
