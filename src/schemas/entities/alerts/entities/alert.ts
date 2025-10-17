import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { alert } from "@/db/schema";

export const alertSchema = createSelectSchema(alert);

export type Alert = z.infer<typeof alertSchema>;
