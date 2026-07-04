import { z } from "@/lib/zod";

import { attachmentSchema } from "../../entities/attachment";

export const createAttachmentResponseSchema = z
  .object({
    data: attachmentSchema,
  })
  .meta({
    title: "Create attachment response",
    description: "Create attachment response description",
    ref: "CreateAttachmentResponseSchema",
  });

export type CreateAttachmentResponse = z.infer<
  typeof createAttachmentResponseSchema
>;
