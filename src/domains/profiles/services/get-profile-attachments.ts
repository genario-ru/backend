import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { profileImageAttachment, profileVideoAttachment } from "@/db/schema";
import type { ProfileAttachmentExtended } from "@/domains/profiles/schemas/entities/profile-attachment";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import { prepareProfileImageAttachmentForResponse } from "../utils/prepare-profile-image-attachment-for-response";
import { prepareProfileVideoAttachmentForResponse } from "../utils/prepare-profile-video-attachment-for-response";

type GetProfileAttachmentsParams = {
  userId: string;
  profileId: string;
};

export async function getProfileAttachments({
  userId,
  profileId,
}: GetProfileAttachmentsParams): Promise<ProfileAttachmentExtended[]> {
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

  const [imageAttachments, videoAttachments] = await Promise.all([
    db.query.profileImageAttachment.findMany({
      where: eq(profileImageAttachment.profileId, profileId),
      orderBy: [asc(profileImageAttachment.createdAt)],
      with: {
        attachment: true,
      },
    }),
    db.query.profileVideoAttachment.findMany({
      where: eq(profileVideoAttachment.profileId, profileId),
      orderBy: [asc(profileVideoAttachment.createdAt)],
      with: {
        attachment: true,
      },
    }),
  ]);

  const preparedImageAttachments = await Promise.all(
    imageAttachments.map(({ attachment, ...profileImageAttachmentItem }) =>
      prepareProfileImageAttachmentForResponse({
        profileImageAttachment: profileImageAttachmentItem,
        attachment,
      }),
    ),
  );

  const preparedVideoAttachments = await Promise.all(
    videoAttachments.map(({ attachment, ...profileVideoAttachmentItem }) =>
      prepareProfileVideoAttachmentForResponse({
        profileVideoAttachment: profileVideoAttachmentItem,
        attachment,
      }),
    ),
  );

  return [...preparedImageAttachments, ...preparedVideoAttachments].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}
