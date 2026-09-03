import { db } from "@/db";
import { profileImageAttachment } from "@/db/schema";
import { createAttachmentFromFile } from "@/domains/attachments/services/create-attachment-from-file";
import type { ProfileAttachmentImageType } from "@/domains/profiles/constants/profile-attachment-types";
import type { ProfileImageAttachmentExtended } from "@/domains/profiles/schemas/entities/profile-image-attachment";
import { toWebpFileName } from "@/lib/attachments/utils/to-webp-file-name";
import { optimizeImageBuffer } from "@/lib/image";

import { prepareProfileImageAttachmentForResponse } from "../utils/prepare-profile-image-attachment-for-response";

type CreateProfileImageAttachmentFromFileParams = {
  userId: string;
  profileId: string;
  type: ProfileAttachmentImageType;
  file: File;
};

export async function createProfileImageAttachmentFromFile({
  userId,
  profileId,
  type,
  file,
}: CreateProfileImageAttachmentFromFileParams): Promise<ProfileImageAttachmentExtended> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const optimized = await optimizeImageBuffer({ buffer: inputBuffer });

  const createdAttachment = await createAttachmentFromFile({
    userId,
    file,
    buffer: optimized.buffer,
    mimeType: optimized.mimeType,
    fileName: toWebpFileName({ fileName: file.name }),
  });

  const [createdProfileImageAttachment] = await db
    .insert(profileImageAttachment)
    .values({
      profileId,
      type,
      attachmentId: createdAttachment.id,
    })
    .returning();

  return prepareProfileImageAttachmentForResponse({
    profileImageAttachment: createdProfileImageAttachment,
    attachment: createdAttachment,
  });
}
