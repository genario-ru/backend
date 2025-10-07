import { tone } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const toneSchema = createSelectSchema(tone);

export type Tone = z.infer<typeof toneSchema>;
