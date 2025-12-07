import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { tone } from "@/db/schema";

export const toneSchema = createSelectSchema(tone).meta({
  title: "Tone",
  description: "Tone description",
  ref: "ToneSchema",
});

export type Tone = z.infer<typeof toneSchema>;
