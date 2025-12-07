import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { videoType } from "@/db/schema";

export const videoTypeSchema = createSelectSchema(videoType).meta({
  title: "Video type",
  description: "Video type description",
  ref: "VideoTypeSchema",
});

export type VideoType = z.infer<typeof videoTypeSchema>;
