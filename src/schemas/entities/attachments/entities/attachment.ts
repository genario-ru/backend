import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { attachment } from "@/db/schema";

export const attachmentSchema = createSelectSchema(attachment).meta({
  title: "Attachment",
  description: "Attachment description",
  ref: "AttachmentSchema",
});

export type Attachment = z.infer<typeof attachmentSchema>;
