import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { scenarioChapter } from "@/db/schema";

import { scenarioSceneSchema } from "./scenario-scene";

export const scenarioChapterSchema = createSelectSchema(scenarioChapter).meta({
  title: "Scenario chapter",
  description: "Scenario chapter description",
  ref: "ScenarioChapterSchema",
});

export type ScenarioChapter = z.infer<typeof scenarioChapterSchema>;

export const scenarioChapterExtendedSchema = scenarioChapterSchema
  .extend({
    scenes: z.array(scenarioSceneSchema),
  })
  .meta({
    title: "Scenario chapter extended",
    description: "Scenario chapter extended description",
    ref: "ScenarioChapterExtendedSchema",
  });

export type ScenarioChapterExtended = z.infer<
  typeof scenarioChapterExtendedSchema
>;
