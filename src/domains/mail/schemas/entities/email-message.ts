import { createSelectSchema } from "drizzle-zod";

import { emailLog } from "@/db/schemas/logs/email-log";
import { z } from "@/lib/zod";

export const emailLogSchema = createSelectSchema(emailLog).meta({
  title: "Email log",
  description: "Email log entry",
  ref: "EmailLogSchema",
});

export type EmailLog = z.infer<typeof emailLogSchema>;
