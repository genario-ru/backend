import * as z from "zod";

import { ideasListExtendedSchema } from "../../entities/ideas-list";

export const getIdeasListResponseSchema = z.object({
  data: ideasListExtendedSchema,
});

export type GetIdeasListResponse = z.infer<typeof getIdeasListResponseSchema>;
