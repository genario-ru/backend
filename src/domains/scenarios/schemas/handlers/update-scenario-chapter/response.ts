import { z } from "@/lib/zod";

import { scenarioChapterSchema } from "../../entities/scenario-chapter";

export const updateScenarioChapterResponseSchema = z
  .object({
    data: scenarioChapterSchema,
  })
  .meta({
    title: "Update scenario chapter response",
    description: "Update scenario chapter response description",
    ref: "UpdateScenarioChapterResponseSchema",
  });

export type UpdateScenarioChapterResponse = z.infer<
  typeof updateScenarioChapterResponseSchema
>;
