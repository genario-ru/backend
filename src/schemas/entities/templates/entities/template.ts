import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { template } from "@/db/schema";

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
