import { z } from "@/lib/zod";

export const IDEAS_LISTS_FILTER_IDS = [
  "sort",
  "templateIds",
  "profileIds",
  "toneIds",
  "videoTypeIds",
] as const;

export type IdeasListsFilterId = (typeof IDEAS_LISTS_FILTER_IDS)[number];

export const ideasListsFilterOptionSchema = z
  .object({
    label: z.string(),
    value: z.string(),
  })
  .meta({
    title: "Ideas lists filter option",
    description: "Ideas lists filter option description",
    ref: "IdeasListsFilterOptionSchema",
  });

export type IdeasListsFilterOption = z.infer<
  typeof ideasListsFilterOptionSchema
>;

const ideasListsFilterSchema = z
  .object({
    slug: z.enum(IDEAS_LISTS_FILTER_IDS),
    name: z.string(),
    icon: z.string().nullable(),
    type: z.enum(["select", "multiselect"]),
    options: z.array(ideasListsFilterOptionSchema),
  })
  .meta({
    title: "Ideas lists filter",
    description: "Ideas lists filter description",
    ref: "IdeasListsFilterSchema",
  });

export type IdeasListsFilter = z.infer<typeof ideasListsFilterSchema>;

export const ideasListsFiltersSchema = z.array(ideasListsFilterSchema).meta({
  title: "Ideas lists filters",
  description: "Ideas lists filters description",
  ref: "IdeasListsFiltersSchema",
});

export type IdeasListsFilters = z.infer<typeof ideasListsFiltersSchema>;
