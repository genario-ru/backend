import { createSelectSchema } from "drizzle-zod";

import { scenarioScene } from "@/db/schema";
import { z } from "@/lib/zod";

import {
  scenarioSceneComponentExtendedSchema,
  scenarioSceneComponentGeneratedSchema,
} from "./scenario-scene-component";
import { scenarioScenePreviewSchema } from "./scenario-scene-preview";

export const scenarioSceneSchema = createSelectSchema(scenarioScene).meta({
  title: "Scenario scene",
  description: "Scenario scene description",
  ref: "ScenarioSceneSchema",
});

export type ScenarioScene = z.infer<typeof scenarioSceneSchema>;

export const scenarioSceneGeneratedSchema = scenarioSceneSchema
  .pick({
    name: true,
    description: true,
    startTime: true,
    endTime: true,
  })
  .refine((scene) => scene.endTime > scene.startTime, {
    message: "End time must be greater than start time",
  })
  .meta({
    title: "Scenario scene generated",
    description: "Scenario scene generated description",
    ref: "ScenarioSceneGeneratedSchema",
  });

export type ScenarioSceneGenerated = z.infer<
  typeof scenarioSceneGeneratedSchema
>;

export const scenarioSceneWithComponentsGeneratedSchema = z
  .object({
    name: z.string(),
    description: z.string().nullable(),
    startTime: z.number(),
    endTime: z.number(),
    components: z.array(scenarioSceneComponentGeneratedSchema),
  })
  .refine((scene) => scene.endTime > scene.startTime, {
    message: "End time must be greater than start time",
  })
  .meta({
    title: "Scenario scene with components generated",
    description: "Scenario scene with components generated description",
    ref: "ScenarioSceneWithComponentsGeneratedSchema",
  });

export type ScenarioSceneWithComponentsGenerated = z.infer<
  typeof scenarioSceneWithComponentsGeneratedSchema
>;

export const scenarioSceneExtendedSchema = scenarioSceneSchema
  .extend({
    preview: scenarioScenePreviewSchema.nullable(),
    components: z.array(scenarioSceneComponentExtendedSchema),
  })
  .meta({
    title: "Scenario scene extended",
    description: "Scenario scene extended description",
    ref: "ScenarioSceneExtendedSchema",
  });

export type ScenarioSceneExtended = z.infer<typeof scenarioSceneExtendedSchema>;
