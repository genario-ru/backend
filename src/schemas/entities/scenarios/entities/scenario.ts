import { scenario } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { scenarioVersionExtendedSchema } from "../../scenario-versions/entities/scenario-version";
import { profileSchema } from "../../profiles/entities/profile";
import { templateSchema } from "../../templates/entities/template";
import { platformSchema } from "../../platforms/entities/platform";
import { videoTypeSchema } from "../../video-types/entities/video-type";
import { videoDurationSchema } from "../../video-durations/entities/video-duration";
import { toneSchema } from "../../tones/entities/tone";

export const scenarioSchema = createSelectSchema(scenario);

export type Scenario = z.infer<typeof scenarioSchema>;

export const scenarioExtendedSchema = scenarioSchema.extend(
  z.object({
    currentVersion: scenarioVersionExtendedSchema.nullish(),
    profile: profileSchema.nullish(),
    template: templateSchema.nullish(),
    platform: platformSchema.nullish(),
    videoType: videoTypeSchema.nullish(),
    videoDuration: videoDurationSchema.nullish(),
    tones: z.array(toneSchema).nullish(),
  }).shape,
);

export type ScenarioExtended = z.infer<typeof scenarioExtendedSchema>;
