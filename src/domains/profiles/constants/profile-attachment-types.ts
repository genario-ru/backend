export const PROFILE_ATTACHMENT_IMAGE_TYPES = [
  "actor-reference",
  "thumbnail-reference",
] as const;

export type ProfileAttachmentImageType =
  (typeof PROFILE_ATTACHMENT_IMAGE_TYPES)[number];

export function isProfileAttachmentImageType(
  type: string,
): type is ProfileAttachmentImageType {
  return (PROFILE_ATTACHMENT_IMAGE_TYPES as readonly string[]).includes(type);
}
