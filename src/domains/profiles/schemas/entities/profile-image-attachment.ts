import { createSelectSchema } from "drizzle-zod";

import { profileImageAttachment } from "@/db/schema";
import { z } from "@/lib/zod";

import { profileAttachmentFileSchema } from "./profile-attachment-file";

export const profileImageAttachmentSchema = createSelectSchema(
  profileImageAttachment,
).meta({
  title: "Profile image attachment",
  description: "Profile image attachment description",
  ref: "ProfileImageAttachmentSchema",
});

export type ProfileImageAttachment = z.infer<
  typeof profileImageAttachmentSchema
>;

export const profileImageAttachmentExtendedSchema =
  profileImageAttachmentSchema.extend({
    attachment: profileAttachmentFileSchema,
  });

export type ProfileImageAttachmentExtended = z.infer<
  typeof profileImageAttachmentExtendedSchema
>;
