import { z } from "@/lib/zod";

import { attachmentSchema } from "@/domains/attachments/schemas/entities/attachment";

export const deleteProfileAttachmentResponseSchema = z
  .object({
    data: attachmentSchema,
  })
  .meta({
    title: "Delete profile attachment response",
    description: "Delete profile attachment response description",
    ref: "DeleteProfileAttachmentResponseSchema",
  });

export type DeleteProfileAttachmentResponse = z.infer<
  typeof deleteProfileAttachmentResponseSchema
>;
