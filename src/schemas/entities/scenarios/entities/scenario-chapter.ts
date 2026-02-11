import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { scenarioChapter } from "@/db/schema";

import { scenariosRegistry } from "../registry";
import { scenarioSceneExtendedSchema } from "./scenario-scene";

export const scenarioChapterSchema = createSelectSchema(
  scenarioChapter,
).register(scenariosRegistry, {
  title: "Scenario chapter",
  description: "Scenario chapter description",
  ref: "ScenarioChapterSchema",
});

export type ScenarioChapter = z.infer<typeof scenarioChapterSchema>;

export const scenarioChapterGeneratedSchema = scenarioChapterSchema
  .pick({
    name: true,
    description: true,
    startTime: true,
    endTime: true,
  })
  .refine((chapter) => chapter.endTime > chapter.startTime, {
    message: "End time must be greater than start time",
  });

export type ScenarioChapterGenerated = z.infer<
  typeof scenarioChapterGeneratedSchema
>;

export const scenarioChapterExtendedSchema = scenarioChapterSchema
  .extend({
    scenes: z.array(scenarioSceneExtendedSchema),
  })
  .register(scenariosRegistry, {
    title: "Scenario chapter extended",
    description: "Scenario chapter extended description",
    ref: "ScenarioChapterExtendedSchema",
  });

export type ScenarioChapterExtended = z.infer<
  typeof scenarioChapterExtendedSchema
>;
