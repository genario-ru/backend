import {
  DEFAULT_IDEAS_LISTS_SORT,
  IDEAS_LISTS_SORT_VALUES,
  type IdeasListsSortField,
  type IdeasListsSortOrder,
} from "@/domains/ideas-lists/schemas/entities/ideas-lists-sort";

export const IDEAS_LISTS_SORT_MAP: Record<
  string,
  { label: string; sortBy: IdeasListsSortField; sortOrder: IdeasListsSortOrder }
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

export const DEFAULT_IDEAS_LISTS_SORT_MAP =
  IDEAS_LISTS_SORT_MAP[DEFAULT_IDEAS_LISTS_SORT];

export const IDEAS_LISTS_SORT_OPTIONS = IDEAS_LISTS_SORT_VALUES.map(
  (value) => ({
    value,
    label: IDEAS_LISTS_SORT_MAP[value].label,
  }),
);
