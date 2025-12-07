import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { template } from "@/db/schema";

export const templateSchema = createSelectSchema(template).meta({
  title: "Template",
  description: "Template description",
  ref: "TemplateSchema",
});

export type Template = z.infer<typeof templateSchema>;
