import { createSelectSchema } from "drizzle-zod";

import { videoDuration } from "@/db/schema";
import { z } from "@/lib/zod";

export const videoDurationSchema = createSelectSchema(videoDuration).meta({
  title: "Video duration",
  description: "Video duration description",
  ref: "VideoDurationSchema",
});

export type VideoDuration = z.infer<typeof videoDurationSchema>;
