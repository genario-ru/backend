import * as z from "zod";

import { ideasListSchema } from "../../entities/ideas-list";

export const deleteIdeasListResponseSchema = z.object({
  data: ideasListSchema,
});

export type DeleteIdeasListResponse = z.infer<
  typeof deleteIdeasListResponseSchema
>;
