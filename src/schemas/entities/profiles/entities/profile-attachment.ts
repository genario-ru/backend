import { createSelectSchema } from "drizzle-zod";

import { profileAttachment } from "@/db/schema";
import { z } from "@/lib/zod";

import { attachmentSchema } from "../../attachments/entities/attachment";

export const profileAttachmentSchema = createSelectSchema(
  profileAttachment,
).meta({
  title: "Profile attachment",
  description: "Profile attachment description",
  ref: "ProfileAttachmentSchema",
});

export type ProfileAttachment = z.infer<typeof profileAttachmentSchema>;

export const ProfileAttachmentExtendedSchema = profileAttachmentSchema
  .extend({ attachment: attachmentSchema })
  .meta({
    title: "Profile attachment extended",
    description: "Profile attachment extended description",
    ref: "ProfileAttachmentExtendedSchema",
  });

export type ProfileAttachmentExtended = z.infer<
  typeof ProfileAttachmentExtendedSchema
>;
