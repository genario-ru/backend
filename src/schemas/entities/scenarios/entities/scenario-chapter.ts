import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { scenarioChapter } from "@/db/schema";

import { scenarioSceneSchema } from "./scenario-scene";

export const scenarioChapterSchema = createSelectSchema(scenarioChapter);

export type ScenarioChapter = z.infer<typeof scenarioChapterSchema>;

export const scenarioChapterExtendedSchema = scenarioChapterSchema.extend(
  z.object({
    scenes: z.array(scenarioSceneSchema),
  }).shape,
);

export type ScenarioChapterExtended = z.infer<
  typeof scenarioChapterExtendedSchema
>;
