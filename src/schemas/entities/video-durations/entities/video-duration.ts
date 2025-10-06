import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { videoDuration } from "@/db/schema";

export const videoDurationSchema = createSelectSchema(videoDuration);

export type VideoDuration = z.infer<typeof videoDurationSchema>;
