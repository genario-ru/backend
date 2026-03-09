import { createSelectSchema } from "drizzle-zod";

import { tone } from "@/db/schema";
import { z } from "@/lib/zod";

import { tonesRegistry } from "../registry";

export const toneSchema = createSelectSchema(tone).register(tonesRegistry, {
  title: "Tone",
  description: "Tone description",
  ref: "ToneSchema",
});

export type Tone = z.infer<typeof toneSchema>;
