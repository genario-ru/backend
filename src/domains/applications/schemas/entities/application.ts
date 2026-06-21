import { createSelectSchema } from "drizzle-zod";

import { application } from "@/db/schema";

export const applicationSchema = createSelectSchema(application).meta({
  title: "Application",
  description: "Application description",
  ref: "ApplicationSchema",
});
