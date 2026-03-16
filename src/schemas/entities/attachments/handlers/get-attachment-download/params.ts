import { z } from "@/lib/zod";

export const getAttachmentDownloadParamsSchema = z.object({
  attachmentId: z.uuid(),
});

export type GetAttachmentDownloadParams = z.infer<
  typeof getAttachmentDownloadParamsSchema
>;
