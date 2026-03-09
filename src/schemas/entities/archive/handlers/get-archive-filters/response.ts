import { z } from "@/lib/zod";

import { archiveFiltersSchema } from "../../entities/archive-filter";
import { archiveRegistry } from "../../registry";

export const getArchiveFiltersResponseSchema = z
  .object({
    data: archiveFiltersSchema,
  })
  .register(archiveRegistry, {
    title: "Get archive filters response",
    description: "Схема ответа с вариантами фильтров архива",
    ref: "GetArchiveFiltersResponseSchema",
  });

export type GetArchiveFiltersResponse = z.infer<
  typeof getArchiveFiltersResponseSchema
>;
