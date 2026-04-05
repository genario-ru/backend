import { createSelectSchema } from "drizzle-zod";

import { alert } from "@/db/schema";
import { z } from "@/lib/zod";

export const alertSchema = createSelectSchema(alert).meta({
  title: "Alert",
  description: "Alert description",
  ref: "AlertSchema",
});

export type Alert = z.infer<typeof alertSchema>;
