import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { scenarioSceneComponent } from "@/db/schema";

import { scenariosRegistry } from "../registry";
import { scenarioSceneComponentTypeSchema } from "./scenario-scene-component-type";

export const scenarioSceneComponentSchema = createSelectSchema(
  scenarioSceneComponent,
).register(scenariosRegistry, {
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
  .register(scenariosRegistry, {
    title: "Scenario scene component type",
    description: "Scenario scene component type description",
    ref: "ScenarioSceneComponentTypeSchema",
  });
