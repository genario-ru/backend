import { createSelectSchema } from "drizzle-zod";

import { attachment } from "@/db/schema";
import { z } from "@/lib/zod";

export const attachmentSchema = createSelectSchema(attachment).meta({
  title: "Attachment",
  description: "Attachment description",
  ref: "AttachmentSchema",
});

export type Attachment = z.infer<typeof attachmentSchema>;
