import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { videoDuration } from "@/db/schema";

export const videoDurationSchema = createSelectSchema(videoDuration).meta({
  title: "Video duration",
  description: "Video duration description",
  ref: "VideoDurationSchema",
});

export type VideoDuration = z.infer<typeof videoDurationSchema>;
