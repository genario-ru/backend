import { attachment } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

export const attachmentSchema = createSelectSchema(attachment);

export type Attachment = z.infer<typeof attachmentSchema>;
