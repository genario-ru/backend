import { createSelectSchema } from "drizzle-zod";

import { profileVideoAttachment } from "@/db/schema";
import { z } from "@/lib/zod";

import { profileAttachmentFileSchema } from "./profile-attachment-file";

export const profileVideoAttachmentSchema = createSelectSchema(
  profileVideoAttachment,
)
  .extend({
    transcriptSegments: z.array(z.unknown()).nullish(),
  })
  .meta({
    title: "Profile video attachment",
    description: "Profile video attachment description",
    ref: "ProfileVideoAttachmentSchema",
  });

export type ProfileVideoAttachment = z.infer<
  typeof profileVideoAttachmentSchema
>;

export const profileVideoAttachmentExtendedSchema =
  profileVideoAttachmentSchema.extend({
    type: z.literal("video-reference"),
    attachment: profileAttachmentFileSchema,
  });

export type ProfileVideoAttachmentExtended = z.infer<
  typeof profileVideoAttachmentExtendedSchema
>;
