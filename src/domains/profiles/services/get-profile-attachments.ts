import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { profileAttachment } from "@/db/schema";
import type { ProfileAttachmentExtended } from "@/domains/profiles/schemas/entities/profile-attachment";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import { prepareProfileAttachmentForResponse } from "../utils/prepare-profile-attachment-for-response";

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

  const profileAttachments = await db.query.profileAttachment.findMany({
    where: eq(profileAttachment.profileId, profileId),
    orderBy: [asc(profileAttachment.createdAt)],
    with: {
      attachment: true,
    },
  });

  return Promise.all(
    profileAttachments.map(({ attachment, ...profileAttachmentItem }) =>
      prepareProfileAttachmentForResponse({
        profileAttachment: profileAttachmentItem,
        attachment,
      }),
    ),
  );
}
