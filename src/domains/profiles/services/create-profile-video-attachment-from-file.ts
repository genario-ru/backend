import { db } from "@/db";
import { profileAttachment } from "@/db/schema";
import { createAttachmentFromFile } from "@/domains/attachments/services/create-attachment-from-file";
import type { ProfileAttachmentExtended } from "@/domains/profiles/schemas/entities/profile-attachment";
import { enqueueProfileAttachmentVideoProcessing } from "@/mq/profile-attachment-video-processing/queue";

import { prepareProfileAttachmentForResponse } from "../utils/prepare-profile-attachment-for-response";

type CreateProfileVideoAttachmentFromFileParams = {
  userId: string;
  profileId: string;
  file: File;
};

export async function createProfileVideoAttachmentFromFile({
  userId,
  profileId,
  file,
}: CreateProfileVideoAttachmentFromFileParams): Promise<ProfileAttachmentExtended> {
  const createdAttachment = await createAttachmentFromFile({
    userId,
    file,
  });

  const [createdProfileAttachment] = await db
    .insert(profileAttachment)
    .values({
      profileId,
      type: "video-reference",
      attachmentId: createdAttachment.id,
      status: "pending",
    })
    .returning();

  await enqueueProfileAttachmentVideoProcessing({
    profileAttachmentId: createdProfileAttachment.id,
  });

  return prepareProfileAttachmentForResponse({
    profileAttachment: createdProfileAttachment,
    attachment: createdAttachment,
  });
}
