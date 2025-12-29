import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { tone } from "@/db/schema";

import { tonesRegistry } from "../registry";

export const toneSchema = createSelectSchema(tone).register(tonesRegistry, {
  title: "Tone",
  description: "Tone description",
  ref: "ToneSchema",
});

export type Tone = z.infer<typeof toneSchema>;
