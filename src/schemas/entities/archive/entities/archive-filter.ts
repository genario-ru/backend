import * as z from "zod";

import { archiveRegistry } from "../registry";

export const archiveFilterOptionSchema = z
  .object({
    label: z.string(),
    value: z.string(),
  })
  .register(archiveRegistry, {
    title: "Archive filter option",
    description: "Опция фильтра (значение и отображаемый текст)",
    ref: "ArchiveFilterOptionSchema",
  });

export type ArchiveFilterOption = z.infer<typeof archiveFilterOptionSchema>;

export const archiveSelectFilterSchema = z
  .object({
    type: z.literal("select"),
    options: z.array(archiveFilterOptionSchema),
  })
  .register(archiveRegistry, {
    title: "Archive select filter",
    description: "Фильтр с одиночным выбором",
    ref: "ArchiveSelectFilterSchema",
  });

export type ArchiveSelectFilter = z.infer<typeof archiveSelectFilterSchema>;

export const archiveMultiSelectFilterSchema = z
  .object({
    type: z.literal("multiselect"),
    options: z.array(archiveFilterOptionSchema),
  })
  .register(archiveRegistry, {
    title: "Archive multiselect filter",
    description: "Фильтр с множественным выбором",
    ref: "ArchiveMultiSelectFilterSchema",
  });

export type ArchiveMultiSelectFilter = z.infer<
  typeof archiveMultiSelectFilterSchema
>;

export const archiveFiltersSchema = z
  .object({
    entity: archiveSelectFilterSchema,
    sortBy: archiveSelectFilterSchema,
    sortOrder: archiveSelectFilterSchema,
    templateIds: archiveMultiSelectFilterSchema,
    profileIds: archiveMultiSelectFilterSchema,
    toneIds: archiveMultiSelectFilterSchema,
    videoTypeIds: archiveMultiSelectFilterSchema,
    platformIds: archiveMultiSelectFilterSchema,
    videoDurationIds: archiveMultiSelectFilterSchema,
  })
  .register(archiveRegistry, {
    title: "Archive filters",
    description: "Набор доступных фильтров архива",
    ref: "ArchiveFiltersSchema",
  });

export type ArchiveFilters = z.infer<typeof archiveFiltersSchema>;
