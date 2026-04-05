import { createSelectSchema } from "drizzle-zod";

import { tone } from "@/db/schema";
import { z } from "@/lib/zod";

export const toneSchema = createSelectSchema(tone).meta({
  title: "Tone",
  description: "Tone description",
  ref: "ToneSchema",
});

export type Tone = z.infer<typeof toneSchema>;
