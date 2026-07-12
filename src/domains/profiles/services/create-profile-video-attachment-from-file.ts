import { db } from "@/db";
import { profileVideoAttachment } from "@/db/schema";
import { createAttachmentFromFile } from "@/domains/attachments/services/create-attachment-from-file";
import type { ProfileVideoAttachmentExtended } from "@/domains/profiles/schemas/entities/profile-video-attachment";
import { enqueueProfileVideoAttachmentEnrichment } from "@/mq/profile-video-attachment-enrichment/queue";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import { prepareProfileVideoAttachmentForResponse } from "../utils/prepare-profile-video-attachment-for-response";

type CreateProfileVideoAttachmentFromFileParams = {
  userId: string;
  profileId: string;
  file: File;
};

export async function createProfileVideoAttachmentFromFile({
  userId,
  profileId,
  file,
}: CreateProfileVideoAttachmentFromFileParams): Promise<ProfileVideoAttachmentExtended> {
  const foundProfile = await db.query.profile.findFirst({
    where: (profileTable, { eq: eqFn, and: andFn }) =>
      andFn(
        eqFn(profileTable.id, profileId),
        eqFn(profileTable.userId, userId),
      ),
  });

  if (!foundProfile) {
    throw throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Профиль не найден или у вас нет доступа к нему",
    });
  }

  const createdAttachment = await createAttachmentFromFile({
    userId,
    file,
  });

  const [createdProfileVideoAttachment] = await db
    .insert(profileVideoAttachment)
    .values({
      profileId,
      attachmentId: createdAttachment.id,
    })
    .returning();

  await enqueueProfileVideoAttachmentEnrichment({
    profileVideoAttachmentId: createdProfileVideoAttachment.id,
  });

  return prepareProfileVideoAttachmentForResponse({
    profileVideoAttachment: createdProfileVideoAttachment,
    attachment: createdAttachment,
  });
}
