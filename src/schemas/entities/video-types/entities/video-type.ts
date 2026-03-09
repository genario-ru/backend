import { createSelectSchema } from "drizzle-zod";

import { videoType } from "@/db/schema";
import { z } from "@/lib/zod";

import { videoTypesRegistry } from "../registry";

export const videoTypeSchema = createSelectSchema(videoType).register(
  videoTypesRegistry,
  {
    title: "Video type",
    description: "Video type description",
    ref: "VideoTypeSchema",
  },
);

export type VideoType = z.infer<typeof videoTypeSchema>;
