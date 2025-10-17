import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { platform } from "@/db/schema";

import { videoTypeSchema } from "../../video-types/entities/video-type";

export const platformSchema = createSelectSchema(platform);

export type Platform = z.infer<typeof platformSchema>;

export const platformExtendedSchema = platformSchema.extend(
  z.object({
    videoTypes: z.array(videoTypeSchema),
  }).shape,
);

export type PlatformExtended = z.infer<typeof platformExtendedSchema>;
