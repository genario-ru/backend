import { z } from "@/lib/zod";

import { scenarioChapterSchema } from "../../entities/scenario-chapter";
import { scenariosRegistry } from "../../registry";

export const updateScenarioChapterResponseSchema = z
  .object({
    data: scenarioChapterSchema,
  })
  .register(scenariosRegistry, {
    title: "Update scenario chapter response",
    description: "Update scenario chapter response description",
    ref: "UpdateScenarioChapterResponseSchema",
  });

export type UpdateScenarioChapterResponse = z.infer<
  typeof updateScenarioChapterResponseSchema
>;
