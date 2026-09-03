import { z } from "@/lib/zod";

import { profileImageAttachmentExtendedSchema } from "./profile-image-attachment";
import { profileVideoAttachmentExtendedSchema } from "./profile-video-attachment";

export type { ProfileAttachmentFile } from "./profile-attachment-file";
export { profileAttachmentFileSchema } from "./profile-attachment-file";

export const profileAttachmentExtendedSchema = z
  .discriminatedUnion("type", [
    profileImageAttachmentExtendedSchema,
    profileVideoAttachmentExtendedSchema,
  ])
  .meta({
    title: "Profile attachment extended",
    description: "Profile attachment extended description",
    ref: "ProfileAttachmentExtendedSchema",
  });

export type ProfileAttachmentExtended = z.infer<
  typeof profileAttachmentExtendedSchema
>;
