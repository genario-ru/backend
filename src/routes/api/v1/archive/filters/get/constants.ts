import {
  ARCHIVE_SORT_VALUES,
  type ArchiveSortField,
  type ArchiveSortOrder,
  DEFAULT_ARCHIVE_SORT,
} from "@/schemas/domains/archive/entities/archive-sort";

export const ARCHIVE_SORT_MAP: Record<
  string,
  { label: string; sortBy: ArchiveSortField; sortOrder: ArchiveSortOrder }
> = {
  createdAtDesc: {
    label: "Дата создания (по убыванию)",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  createdAtAsc: {
    label: "Дата создания (по возрастанию)",
    sortBy: "createdAt",
    sortOrder: "asc",
  },
  updatedAtDesc: {
    label: "Дата изменения (по убыванию)",
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
  updatedAtAsc: {
    label: "Дата изменения (по возрастанию)",
    sortBy: "updatedAt",
    sortOrder: "asc",
  },
};

export const DEFAULT_ARCHIVE_SORT_MAP = ARCHIVE_SORT_MAP[DEFAULT_ARCHIVE_SORT];

export const ARCHIVE_SORT_OPTIONS = ARCHIVE_SORT_VALUES.map((value) => ({
  value,
  label: ARCHIVE_SORT_MAP[value].label,
}));
