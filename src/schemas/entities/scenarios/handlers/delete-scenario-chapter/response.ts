import { z } from "@/lib/zod";

import { scenarioChapterSchema } from "../../entities/scenario-chapter";
import { scenariosRegistry } from "../../registry";

export const deleteScenarioChapterResponseSchema = z
  .object({
    data: scenarioChapterSchema,
  })
  .register(scenariosRegistry, {
    title: "Delete scenario chapter response",
    description: "Delete scenario chapter response description",
    ref: "DeleteScenarioChapterResponseSchema",
  });

export type DeleteScenarioChapterResponse = z.infer<
  typeof deleteScenarioChapterResponseSchema
>;
