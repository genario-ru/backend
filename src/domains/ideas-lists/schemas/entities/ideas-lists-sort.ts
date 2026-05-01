import { z } from "@/lib/zod";

export const IDEAS_LISTS_SORT_VALUES = [
  "createdAtDesc",
  "createdAtAsc",
  "updatedAtDesc",
  "updatedAtAsc",
] as const;

export const ideasListsSortSchema = z.enum(IDEAS_LISTS_SORT_VALUES).meta({
  title: "Ideas lists sort",
  description: "Ideas lists sort description",
  ref: "IdeasListsSortSchema",
});

export type IdeasListsSort = (typeof IDEAS_LISTS_SORT_VALUES)[number];
export type IdeasListsSortField = "createdAt" | "updatedAt";
export type IdeasListsSortOrder = "asc" | "desc";

export const DEFAULT_IDEAS_LISTS_SORT: IdeasListsSort = "createdAtDesc";
