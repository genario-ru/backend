import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { videoType } from "@/db/schema";

export const videoTypeSchema = createSelectSchema(videoType);

export type VideoType = z.infer<typeof videoTypeSchema>;
