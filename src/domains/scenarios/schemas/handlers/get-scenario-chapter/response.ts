import { z } from "@/lib/zod";

import { scenarioChapterExtendedSchema } from "../../entities/scenario-chapter";

export const getScenarioChapterResponseSchema = z
  .object({
    data: scenarioChapterExtendedSchema,
  })
  .meta({
    title: "Get scenario chapter response",
    description: "Get scenario chapter response description",
    ref: "GetScenarioChapterResponseSchema",
  });

export type GetScenarioChapterResponse = z.infer<
  typeof getScenarioChapterResponseSchema
>;
