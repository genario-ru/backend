import { scenarioVersion } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";
import { profileSchema } from "../../profiles/entities/profile";
import { platformSchema } from "../../platforms/entities/platform";
import { videoTypeSchema } from "../../video-types/entities/video-type";
import { videoDurationSchema } from "../../video-durations/entities/video-duration";
import { toneSchema } from "../../tones/entities/tone";
import { scenarioChapterSchema } from "./scenario-chapter";

export const scenarioVersionSchema = createSelectSchema(scenarioVersion);

export type ScenarioVersion = z.infer<typeof scenarioVersionSchema>;

export const scenarioVersionExtendedSchema = scenarioVersionSchema.extend(
  z.object({
    profile: profileSchema.nullable(),
    platform: platformSchema.nullable(),
    videoType: videoTypeSchema.nullable(),
    videoDuration: videoDurationSchema.nullable(),
    tones: z.array(toneSchema).nullable(),
    scenarioChapters: z.array(scenarioChapterSchema).nullable(),
  }).shape,
);

export type ScenarioVersionExtended = z.infer<
  typeof scenarioVersionExtendedSchema
>;
