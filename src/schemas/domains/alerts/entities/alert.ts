import { alert } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

export const alertSchema = createSelectSchema(alert);

export type Alert = z.infer<typeof alertSchema>;
