import { z } from "@/lib/zod";

export const deleteProfileAttachmentParamsSchema = z.object({
  attachmentId: z.uuid(),
});

export type DeleteProfileAttachmentParams = z.infer<
  typeof deleteProfileAttachmentParamsSchema
>;
