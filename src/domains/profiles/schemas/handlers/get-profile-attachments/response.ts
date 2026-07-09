import { z } from "@/lib/zod";

import { profileReferencesSchema } from "../../entities/profile-reference";

export const getProfileAttachmentsResponseSchema = z
  .object({
    data: profileReferencesSchema,
  })
  .meta({
    title: "Get profile attachments response",
    description: "Get profile attachments response description",
    ref: "GetProfileAttachmentsResponseSchema",
  });

export type GetProfileAttachmentsResponse = z.infer<
  typeof getProfileAttachmentsResponseSchema
>;
