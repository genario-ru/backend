import { createSelectSchema } from "drizzle-zod";

import { scenarioVersion } from "@/db/schema";
import { platformSchema } from "@/domains/platforms/schemas/entities/platform";
import { profileSchema } from "@/domains/profiles/schemas/entities/profile";
import { toneSchema } from "@/domains/tones/schemas/entities/tone";
import { videoDurationSchema } from "@/domains/video-durations/schemas/entities/video-duration";
import { videoTypeSchema } from "@/domains/video-types/schemas/entities/video-type";
import { z } from "@/lib/zod";

import { scenarioChapterSchema } from "./scenario-chapter";

export const scenarioVersionSchema = createSelectSchema(scenarioVersion).meta({
  title: "Scenario version",
  description: "Scenario version description",
  ref: "ScenarioVersionSchema",
});

export type ScenarioVersion = z.infer<typeof scenarioVersionSchema>;

export const scenarioVersionExtendedSchema = scenarioVersionSchema
  .extend({
    profile: profileSchema.nullish(),
    platform: platformSchema.nullish(),
    videoType: videoTypeSchema.nullish(),
    videoDuration: videoDurationSchema.nullish(),
    tones: z.array(toneSchema).nullish(),
    scenarioChapters: z.array(scenarioChapterSchema).nullish(),
  })
  .meta({
    title: "Scenario version extended",
    description: "Scenario version extended description",
    ref: "ScenarioVersionExtendedSchema",
  });

export type ScenarioVersionExtended = z.infer<
  typeof scenarioVersionExtendedSchema
>;
