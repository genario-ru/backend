import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { template } from "@/db/schema";

export const templateSchema = createSelectSchema(template);

export type Template = z.infer<typeof templateSchema>;
