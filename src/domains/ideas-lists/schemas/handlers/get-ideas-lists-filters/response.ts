import { ideasListsFiltersSchema } from "@/domains/ideas-lists/schemas/entities/ideas-lists-filter";
import { z } from "@/lib/zod";

export const getIdeasListsFiltersResponseSchema = z
  .object({
    data: ideasListsFiltersSchema,
  })
  .meta({
    title: "Get ideas lists filters response",
    description: "Ideas lists filters response payload",
    ref: "GetIdeasListsFiltersResponseSchema",
  });

export type GetIdeasListsFiltersResponse = z.infer<
  typeof getIdeasListsFiltersResponseSchema
>;
