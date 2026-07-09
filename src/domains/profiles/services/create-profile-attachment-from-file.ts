import { eq } from "drizzle-orm";

import { db } from "@/db";
import { attachment, profileAttachment } from "@/db/schema";
import { createAttachmentFromFile } from "@/domains/attachments/services/create-attachment-from-file";
import type { ProfileAttachmentExtended } from "@/domains/profiles/schemas/entities/profile-attachment";
import type { ProfileAttachmentRecord } from "@/domains/profiles/types/profile-response";
import { createS3ObjectUrl } from "@/lib/s3/utils/create-s3-object-url";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

type CreateProfileAttachmentFromFileParams = {
  userId: string;
  profileId: string;
  type: ProfileAttachmentRecord["type"];
  file: File;
};

export async function createProfileAttachmentFromFile({
  userId,
  profileId,
  type,
  file,
}: CreateProfileAttachmentFromFileParams): Promise<ProfileAttachmentExtended> {
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

  const [attachmentWithUrl] = await db
    .update(attachment)
    .set({
      url: createS3ObjectUrl({
        bucketName: createdAttachment.bucketName,
        key: createdAttachment.key,
      }),
    })
    .where(eq(attachment.id, createdAttachment.id))
    .returning();

  const [createdProfileAttachment] = await db
    .insert(profileAttachment)
    .values({
      profileId,
      type,
      attachmentId: attachmentWithUrl.id,
    })
    .returning();

  return {
    ...createdProfileAttachment,
    attachment: attachmentWithUrl,
  };
}
