import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { attachment } from "@/db/schema";

export const attachmentSchema = createSelectSchema(attachment);

export type Attachment = z.infer<typeof attachmentSchema>;
