import { z } from "@/lib/zod";

import { scenariosRegistry } from "../../registry";

export const deleteScenarioChapterParamsSchema = z
  .object({
    chapterId: z.uuid(),
  })
  .register(scenariosRegistry, {
    title: "Delete scenario chapter params",
    description: "Delete scenario chapter params description",
    ref: "DeleteScenarioChapterParamsSchema",
  });

export type DeleteScenarioChapterParams = z.infer<
  typeof deleteScenarioChapterParamsSchema
>;
