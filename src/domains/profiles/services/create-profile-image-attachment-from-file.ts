import { db } from "@/db";
import { profileAttachment } from "@/db/schema";
import { createAttachmentFromFile } from "@/domains/attachments/services/create-attachment-from-file";
import type { ProfileAttachmentImageType } from "@/domains/profiles/constants/profile-attachment-types";
import type { ProfileAttachmentExtended } from "@/domains/profiles/schemas/entities/profile-attachment";
import { toWebpFileName } from "@/lib/attachments/utils/to-webp-file-name";
import { optimizeImageBuffer } from "@/lib/image";

import { prepareProfileAttachmentForResponse } from "../utils/prepare-profile-attachment-for-response";

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
}: CreateProfileImageAttachmentFromFileParams): Promise<ProfileAttachmentExtended> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const optimized = await optimizeImageBuffer({ buffer: inputBuffer });

  const createdAttachment = await createAttachmentFromFile({
    userId,
    file,
    buffer: optimized.buffer,
    mimeType: optimized.mimeType,
    fileName: toWebpFileName({ fileName: file.name }),
  });

  const [createdProfileAttachment] = await db
    .insert(profileAttachment)
    .values({
      profileId,
      type,
      attachmentId: createdAttachment.id,
    })
    .returning();

  return prepareProfileAttachmentForResponse({
    profileAttachment: createdProfileAttachment,
    attachment: createdAttachment,
  });
}
