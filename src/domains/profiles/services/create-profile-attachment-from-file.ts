import { db } from "@/db";
import { isProfileAttachmentImageType } from "@/domains/profiles/constants/profile-attachment-types";
import type { ProfileAttachmentExtended } from "@/domains/profiles/schemas/entities/profile-attachment";
import type { ProfileAttachmentRecord } from "@/domains/profiles/types/profile-response";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import { createProfileImageAttachmentFromFile } from "./create-profile-image-attachment-from-file";
import { createProfileVideoAttachmentFromFile } from "./create-profile-video-attachment-from-file";

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

  if (isProfileAttachmentImageType(type)) {
    return createProfileImageAttachmentFromFile({
      userId,
      profileId,
      type,
      file,
    });
  }

  return createProfileVideoAttachmentFromFile({
    userId,
    profileId,
    file,
  });
}
