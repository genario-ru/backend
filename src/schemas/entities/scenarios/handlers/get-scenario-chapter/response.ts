import { z } from "@/lib/zod";

import { scenarioChapterExtendedSchema } from "../../entities/scenario-chapter";
import { scenariosRegistry } from "../../registry";

export const getScenarioChapterResponseSchema = z
  .object({
    data: scenarioChapterExtendedSchema,
  })
  .register(scenariosRegistry, {
    title: "Get scenario chapter response",
    description: "Get scenario chapter response description",
    ref: "GetScenarioChapterResponseSchema",
  });

export type GetScenarioChapterResponse = z.infer<
  typeof getScenarioChapterResponseSchema
>;
