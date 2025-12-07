import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { alert } from "@/db/schema";

export const alertSchema = createSelectSchema(alert).meta({
  title: "Alert",
  description: "Alert description",
  ref: "AlertSchema",
});

export type Alert = z.infer<typeof alertSchema>;
