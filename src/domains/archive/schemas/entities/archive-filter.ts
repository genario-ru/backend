import { z } from "@/lib/zod";

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
  .meta({
    title: "Archive filter option",
    description: "Archive filter option description",
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
  .meta({
    title: "Archive filter",
    description: "Archive filter description",
    ref: "ArchiveFilterSchema",
  });

export type ArchiveFilter = z.infer<typeof archiveFilterSchema>;

export const archiveFiltersSchema = z.array(archiveFilterSchema).meta({
  title: "Archive filters",
  description: "Archive filters description",
  ref: "ArchiveFiltersSchema",
});

export type ArchiveFilters = z.infer<typeof archiveFiltersSchema>;
