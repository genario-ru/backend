import { createSelectSchema } from "drizzle-zod";

import { scenarioSceneComponent } from "@/db/schema";
import { z } from "@/lib/zod";

import { scenarioSceneComponentTypeSchema } from "./scenario-scene-component-type";

export const scenarioSceneComponentSchema = createSelectSchema(
  scenarioSceneComponent,
).meta({
  title: "Scenario scene component",
  description: "Scenario scene component description",
  ref: "ScenarioSceneComponentSchema",
});

export type ScenarioSceneComponent = z.infer<
  typeof scenarioSceneComponentSchema
>;

export const scenarioSceneComponentGeneratedSchema =
  scenarioSceneComponentSchema
    .pick({ typeId: true })
    .extend({
      name: z.string().min(3).max(256),
      content: z.string().min(16).max(4096),
    })
    .meta({
      title: "Scenario scene component generated",
      description: "Scenario scene component generated description",
      ref: "ScenarioSceneComponentGeneratedSchema",
    });

export type ScenarioSceneComponentGenerated = z.infer<
  typeof scenarioSceneComponentGeneratedSchema
>;

export const scenarioSceneComponentExtendedSchema = createSelectSchema(
  scenarioSceneComponent,
)
  .extend({
    type: scenarioSceneComponentTypeSchema,
  })
  .meta({
    title: "Scenario scene component extend",
    description: "Scenario scene component extend description",
    ref: "ScenarioSceneComponentExtendedSchema",
  });
