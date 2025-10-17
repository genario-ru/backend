import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { tone } from "@/db/schema";

export const toneSchema = createSelectSchema(tone);

export type Tone = z.infer<typeof toneSchema>;
