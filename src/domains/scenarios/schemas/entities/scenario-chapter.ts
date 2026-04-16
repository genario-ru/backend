import { createSelectSchema } from "drizzle-zod";

import { scenarioChapter } from "@/db/schema";
import { productionStatusSchema } from "@/domains/production-statuses/entities/production-status";
import { z } from "@/lib/zod";

import { scenarioSceneExtendedSchema } from "./scenario-scene";

export const scenarioChapterSchema = createSelectSchema(scenarioChapter).meta({
  title: "Scenario chapter",
  description: "Scenario chapter description",
  ref: "ScenarioChapterSchema",
});

export type ScenarioChapter = z.infer<typeof scenarioChapterSchema>;

export const scenarioChapterGeneratedSchema = scenarioChapterSchema
  .pick({
    startTime: true,
    endTime: true,
  })
  .extend({
    name: z.string().min(3).max(256),
    description: z.string().min(16).max(4096),
  })
  .refine((chapter) => chapter.endTime > chapter.startTime, {
    message: "End time must be greater than start time",
  })
  .meta({
    title: "Scenario chapter generated",
    description: "Scenario chapter generated description",
    ref: "ScenarioChapterGeneratedSchema",
  });

export type ScenarioChapterGenerated = z.infer<
  typeof scenarioChapterGeneratedSchema
>;

export const scenarioChapterExtendedSchema = scenarioChapterSchema
  .extend({
    productionStatus: productionStatusSchema.nullish(),
    scenes: z.array(scenarioSceneExtendedSchema),
  })
  .meta({
    title: "Scenario chapter extended",
    description: "Scenario chapter extended description",
    ref: "ScenarioChapterExtendedSchema",
  });

export type ScenarioChapterExtended = z.infer<
  typeof scenarioChapterExtendedSchema
>;
