import { z } from "@/lib/zod";

import { archiveFiltersSchema } from "../../entities/archive-filter";
export const getArchiveFiltersResponseSchema = z
  .object({
    data: archiveFiltersSchema,
  })
  .meta({
    title: "Get archive filters response",
    description: "Схема ответа с вариантами фильтров архива",
    ref: "GetArchiveFiltersResponseSchema",
  });

export type GetArchiveFiltersResponse = z.infer<
  typeof getArchiveFiltersResponseSchema
>;
