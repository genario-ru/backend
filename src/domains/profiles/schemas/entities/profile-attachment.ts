import { createSelectSchema } from "drizzle-zod";

import { profileAttachment } from "@/db/schema";
import { attachmentSchema } from "@/domains/attachments/schemas/entities/attachment";
import { z } from "@/lib/zod";

export const profileAttachmentSchema = createSelectSchema(
  profileAttachment,
).meta({
  title: "Profile attachment",
  description: "Profile attachment description",
  ref: "ProfileAttachmentSchema",
});

export type ProfileAttachment = z.infer<typeof profileAttachmentSchema>;

export const profileAttachmentFileSchema = attachmentSchema
  .omit({
    key: true,
    bucketName: true,
  })
  .extend({
    url: z.string(),
  })
  .meta({
    title: "Profile attachment file",
    description: "Profile attachment file description",
    ref: "ProfileAttachmentFileSchema",
  });

export type ProfileAttachmentFile = z.infer<typeof profileAttachmentFileSchema>;

export const profileAttachmentExtendedSchema = profileAttachmentSchema
  .extend({
    attachment: profileAttachmentFileSchema,
  })
  .meta({
    title: "Profile attachment extended",
    description: "Profile attachment extended description",
    ref: "ProfileAttachmentExtendedSchema",
  });

export type ProfileAttachmentExtended = z.infer<
  typeof profileAttachmentExtendedSchema
>;
