import { createSelectSchema } from "drizzle-zod";

import { scenarioMetadata } from "@/db/schema";
import { platformSchema } from "@/domains/platforms/schemas/entities/platform";
import { z } from "@/lib/zod";

export const scenarioMetadataSchema = createSelectSchema(scenarioMetadata).meta(
  {
    title: "Scenario metadata",
    description: "Scenario metadata description",
    ref: "ScenarioMetadataSchema",
  },
);

export type ScenarioMetadata = z.infer<typeof scenarioMetadataSchema>;

export const scenarioMetadataExtendedSchema = scenarioMetadataSchema
  .extend({
    platform: platformSchema,
  })
  .meta({
    title: "Scenario metadata extended",
    description: "Scenario metadata extended description",
    ref: "ScenarioMetadataExtendedSchema",
  });

export type ScenarioMetadataExtended = z.infer<
  typeof scenarioMetadataExtendedSchema
>;

export const scenarioMetadataItemGeneratedSchema = z.object({
  platformId: z.uuid(),
  title: z.string().min(1).max(512),
  body: z.string().min(1).max(8192),
  tags: z.string().max(2048),
});

export type ScenarioMetadataItemGenerated = z.infer<
  typeof scenarioMetadataItemGeneratedSchema
>;
