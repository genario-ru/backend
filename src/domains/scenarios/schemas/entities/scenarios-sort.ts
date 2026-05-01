import { z } from "@/lib/zod";

export const SCENARIOS_SORT_VALUES = [
  "createdAtDesc",
  "createdAtAsc",
  "updatedAtDesc",
  "updatedAtAsc",
  "scheduledStartAtDesc",
  "scheduledStartAtAsc",
] as const;

export const scenariosSortSchema = z.enum(SCENARIOS_SORT_VALUES).meta({
  title: "Scenarios sort",
  description: "Scenarios sort description",
  ref: "ScenariosSortSchema",
});

export type ScenariosSort = (typeof SCENARIOS_SORT_VALUES)[number];
export type ScenariosSortField = "createdAt" | "updatedAt" | "scheduledStartAt";
export type ScenariosSortOrder = "asc" | "desc";

export const DEFAULT_SCENARIOS_SORT: ScenariosSort = "createdAtDesc";
