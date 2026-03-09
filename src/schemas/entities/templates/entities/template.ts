import { createSelectSchema } from "drizzle-zod";

import { template } from "@/db/schema";
import { z } from "@/lib/zod";

export const templateSchema = createSelectSchema(template).meta({
  title: "Template",
  description: "Template description",
  ref: "TemplateSchema",
});

export type Template = z.infer<typeof templateSchema>;
