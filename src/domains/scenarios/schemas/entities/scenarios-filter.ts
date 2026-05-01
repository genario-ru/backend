import { z } from "@/lib/zod";

export const SCENARIOS_FILTER_IDS = [
  "sort",
  "templateIds",
  "profileIds",
  "toneIds",
  "videoTypeIds",
  "platformIds",
  "videoDurationIds",
  "productionStatusIds",
] as const;

export type ScenariosFilterId = (typeof SCENARIOS_FILTER_IDS)[number];

export const scenariosFilterOptionSchema = z
  .object({
    label: z.string(),
    value: z.string(),
  })
  .meta({
    title: "Scenarios filter option",
    description: "Scenarios filter option description",
    ref: "ScenariosFilterOptionSchema",
  });

export type ScenariosFilterOption = z.infer<typeof scenariosFilterOptionSchema>;

const scenariosFilterSchema = z
  .object({
    slug: z.enum(SCENARIOS_FILTER_IDS),
    name: z.string(),
    icon: z.string().nullable(),
    type: z.enum(["select", "multiselect"]),
    options: z.array(scenariosFilterOptionSchema),
  })
  .meta({
    title: "Scenarios filter",
    description: "Scenarios filter description",
    ref: "ScenariosFilterSchema",
  });

export type ScenariosFilter = z.infer<typeof scenariosFilterSchema>;

export const scenariosFiltersSchema = z.array(scenariosFilterSchema).meta({
  title: "Scenarios filters",
  description: "Scenarios filters description",
  ref: "ScenariosFiltersSchema",
});

export type ScenariosFilters = z.infer<typeof scenariosFiltersSchema>;
