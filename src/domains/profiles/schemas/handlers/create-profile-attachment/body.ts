import { profileImageAttachmentType } from "@/db/schema";
import { z } from "@/lib/zod";

export const PROFILE_ATTACHMENT_VIDEO_TYPE = "video-reference" as const;

const profileAttachmentTypeValues = [
  ...profileImageAttachmentType.enumValues,
  PROFILE_ATTACHMENT_VIDEO_TYPE,
] as const;

export const createProfileAttachmentBodySchema = z
  .object({
    file: z.file().min(1),
    type: z.enum(profileAttachmentTypeValues),
  })
  .meta({
    title: "Create profile attachment body",
    description: "Create profile attachment body description",
    ref: "CreateProfileAttachmentBodySchema",
  });

export type CreateProfileAttachmentBody = z.infer<
  typeof createProfileAttachmentBodySchema
>;

export type CreateProfileAttachmentType = CreateProfileAttachmentBody["type"];
