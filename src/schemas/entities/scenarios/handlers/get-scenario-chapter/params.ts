import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const getScenarioChapterParamsSchema = z
  .object({
    chapterId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Get scenario chapter params",
    description: "Get scenario chapter params description",
    ref: "GetScenarioChapterParamsSchema",
  });

export type GetScenarioChapterParams = z.infer<
  typeof getScenarioChapterParamsSchema
>;
