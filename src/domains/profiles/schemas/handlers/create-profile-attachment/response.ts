import { z } from "@/lib/zod";

import { profileAttachmentExtendedSchema } from "../../entities/profile-attachment";

export const createProfileAttachmentResponseSchema = z
  .object({
    data: profileAttachmentExtendedSchema,
  })
  .meta({
    title: "Create profile attachment response",
    description: "Create profile attachment response description",
    ref: "CreateProfileAttachmentResponseSchema",
  });

export type CreateProfileAttachmentResponse = z.infer<
  typeof createProfileAttachmentResponseSchema
>;
