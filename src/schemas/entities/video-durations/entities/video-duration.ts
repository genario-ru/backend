import { createSelectSchema } from "drizzle-zod";

import { videoDuration } from "@/db/schema";
import { z } from "@/lib/zod";

import { videoDurationsRegistry } from "../registry";

export const videoDurationSchema = createSelectSchema(videoDuration).register(
  videoDurationsRegistry,
  {
    title: "Video duration",
    description: "Video duration description",
    ref: "VideoDurationSchema",
  },
);

export type VideoDuration = z.infer<typeof videoDurationSchema>;
