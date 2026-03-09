import { z } from "@/lib/zod";

export const ARCHIVE_SORT_VALUES = [
  "createdAtDesc",
  "createdAtAsc",
  "updatedAtDesc",
  "updatedAtAsc",
] as const;

export const archiveSortSchema = z.enum(ARCHIVE_SORT_VALUES);

export type ArchiveSort = (typeof ARCHIVE_SORT_VALUES)[number];

export type ArchiveSortField = "createdAt" | "updatedAt";
export type ArchiveSortOrder = "asc" | "desc";

export const DEFAULT_ARCHIVE_SORT: ArchiveSort = "createdAtDesc";
