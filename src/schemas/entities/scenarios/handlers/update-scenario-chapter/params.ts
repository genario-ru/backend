import * as z from "zod";

import { scenariosRegistry } from "../../registry";

export const updateScenarioChapterParamsSchema = z
  .object({
    chapterId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Update scenario chapter params",
    description: "Update scenario chapter params description",
    ref: "UpdateScenarioChapterParamsSchema",
  });

export type UpdateScenarioChapterParams = z.infer<
  typeof updateScenarioChapterParamsSchema
>;
