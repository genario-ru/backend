import {
  DEFAULT_SCENARIOS_SORT,
  SCENARIOS_SORT_VALUES,
  type ScenariosSortField,
  type ScenariosSortOrder,
} from "@/domains/scenarios/schemas/entities/scenarios-sort";

export const SCENARIOS_SORT_MAP: Record<
  string,
  { label: string; sortBy: ScenariosSortField; sortOrder: ScenariosSortOrder }
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
  scheduledStartAtDesc: {
    label: "Дата планирования (по убыванию)",
    sortBy: "scheduledStartAt",
    sortOrder: "desc",
  },
  scheduledStartAtAsc: {
    label: "Дата планирования (по возрастанию)",
    sortBy: "scheduledStartAt",
    sortOrder: "asc",
  },
};

export const DEFAULT_SCENARIOS_SORT_MAP =
  SCENARIOS_SORT_MAP[DEFAULT_SCENARIOS_SORT];

export const SCENARIOS_SORT_OPTIONS = SCENARIOS_SORT_VALUES.map((value) => ({
  value,
  label: SCENARIOS_SORT_MAP[value].label,
}));
