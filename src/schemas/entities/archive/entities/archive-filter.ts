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

const archiveFilterSchema = z
  .object({
    slug: z.enum(ARCHIVE_FILTER_IDS),
    name: z.string(),
    icon: z.string().nullable(),
    type: z.enum(["select", "multiselect"]),
    options: z.array(archiveFilterOptionSchema),
  })
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
