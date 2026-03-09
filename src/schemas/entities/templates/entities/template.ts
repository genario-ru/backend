import { createSelectSchema } from "drizzle-zod";

import { template } from "@/db/schema";
import { z } from "@/lib/zod";

import { templatesRegistry } from "../registry";

export const templateSchema = createSelectSchema(template).register(
  templatesRegistry,
  {
    title: "Template",
    description: "Template description",
    ref: "TemplateSchema",
  },
);

export type Template = z.infer<typeof templateSchema>;
