import { attachmentSchema } from "@/domains/attachments/schemas/entities/attachment";
import { z } from "@/lib/zod";

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
