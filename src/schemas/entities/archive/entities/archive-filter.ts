import * as z from "zod";

import { archiveRegistry } from "../registry";

export const ARCHIVE_FILTER_IDS = [
  "entity",
  "sort",
  "templateIds",
  "profileIds",
  "toneIds",
  "videoTypeIds",
  "platformIds",
  "videoDurationIds",
] as const;

export type ArchiveFilterId = (typeof ARCHIVE_FILTER_IDS)[number];

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

const archiveFilterBaseSchema = z.object({
  slug: z.enum(ARCHIVE_FILTER_IDS),
  name: z.string(),
  icon: z.string().nullable(),
  options: z.array(archiveFilterOptionSchema),
});

export const archiveSelectFilterSchema = archiveFilterBaseSchema
  .extend({
    type: z.literal("select"),
  })
  .register(archiveRegistry, {
    title: "Archive select filter",
    description: "Фильтр с одиночным выбором",
    ref: "ArchiveSelectFilterSchema",
  });

export type ArchiveSelectFilter = z.infer<typeof archiveSelectFilterSchema>;

export const archiveMultiSelectFilterSchema = archiveFilterBaseSchema
  .extend({
    type: z.literal("multiselect"),
  })
  .register(archiveRegistry, {
    title: "Archive multiselect filter",
    description: "Фильтр с множественным выбором",
    ref: "ArchiveMultiSelectFilterSchema",
  });

export type ArchiveMultiSelectFilter = z.infer<
  typeof archiveMultiSelectFilterSchema
>;

export const archiveFilterSchema = z
  .union([archiveSelectFilterSchema, archiveMultiSelectFilterSchema])
  .register(archiveRegistry, {
    title: "Archive filter",
    description: "Фильтр архива",
    ref: "ArchiveFilterSchema",
  });

export type ArchiveFilter = z.infer<typeof archiveFilterSchema>;

export const archiveFiltersSchema = z
  .array(archiveFilterSchema)
  .register(archiveRegistry, {
    title: "Archive filters",
    description: "Набор доступных фильтров архива",
    ref: "ArchiveFiltersSchema",
  });

export type ArchiveFilters = z.infer<typeof archiveFiltersSchema>;
