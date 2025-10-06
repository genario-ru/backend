import { videoType } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const videoTypeSchema = createSelectSchema(videoType);

export type VideoType = z.infer<typeof videoTypeSchema>;
