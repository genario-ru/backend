import { createSelectSchema } from "drizzle-zod";

import { scenario } from "@/db/schema";
import { platformSchema } from "@/domains/platforms/schemas/entities/platform";
import { productionStatusSchema } from "@/domains/production-statuses/entities/production-status";
import { profileSchema } from "@/domains/profiles/schemas/entities/profile";
import { templateSchema } from "@/domains/templates/schemas/entities/template";
import { toneSchema } from "@/domains/tones/schemas/entities/tone";
import { videoDurationSchema } from "@/domains/video-durations/schemas/entities/video-duration";
import { videoTypeSchema } from "@/domains/video-types/schemas/entities/video-type";
import { z } from "@/lib/zod";

import { scenarioVersionExtendedSchema } from "./scenario-version";

export const scenarioSchema = createSelectSchema(scenario).meta({
  title: "Scenario",
  description: "Scenario description",
  ref: "ScenarioSchema",
});

export type Scenario = z.infer<typeof scenarioSchema>;

export const scenarioExtendedSchema = scenarioSchema
  .extend({
    currentVersion: scenarioVersionExtendedSchema.nullish(),
    profile: profileSchema.nullish(),
    template: templateSchema.nullish(),
    videoType: videoTypeSchema.nullish(),
    videoDuration: videoDurationSchema.nullish(),
    productionStatus: productionStatusSchema.nullish(),
    platforms: z.array(platformSchema).nullish(),
    tones: z.array(toneSchema).nullish(),
  })
  .meta({
    title: "Scenario extended",
    description: "Scenario extended description",
    ref: "ScenarioExtendedSchema",
  });

export type ScenarioExtended = z.infer<typeof scenarioExtendedSchema>;
