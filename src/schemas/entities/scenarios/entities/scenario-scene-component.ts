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
    .pick({
      name: true,
      content: true,
      typeId: true,
    })
    .extend({
      content: scenarioSceneComponentSchema.shape.content.describe(
        "Markdown formatted text for the scene component content.",
      ),
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
