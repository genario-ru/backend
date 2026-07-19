import { z } from "@/lib/zod";

import { profileAttachmentExtendedSchema } from "../../entities/profile-attachment";

export const getProfileAttachmentsResponseSchema = z
  .object({
    data: z.array(profileAttachmentExtendedSchema),
  })
  .meta({
    title: "Get profile attachments response",
    description: "Get profile attachments response description",
    ref: "GetProfileAttachmentsResponseSchema",
  });

export type GetProfileAttachmentsResponse = z.infer<
  typeof getProfileAttachmentsResponseSchema
>;
