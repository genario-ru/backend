import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { profileAttachment } from "@/db/schema";

import { attachmentSchema } from "../../attachments/entities/attachment";

export const profileAttachmentSchema = createSelectSchema(profileAttachment);

export type ProfileAttachment = z.infer<typeof profileAttachmentSchema>;

export const ProfileAttachmentExtendedSchema = profileAttachmentSchema.extend(
  z.object({
    attachment: attachmentSchema,
  }).shape,
);

export type ProfileAttachmentExtended = z.infer<
  typeof ProfileAttachmentExtendedSchema
>;
