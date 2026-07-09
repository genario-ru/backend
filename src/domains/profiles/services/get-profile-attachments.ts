import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { profileAttachment } from "@/db/schema";
import type { ProfileReferences } from "@/domains/profiles/schemas/entities/profile-reference";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import { prepareProfileReferences } from "../utils/prepare-profile-references";

type GetProfileAttachmentsParams = {
  userId: string;
  profileId: string;
};

export async function getProfileAttachments({
  userId,
  profileId,
}: GetProfileAttachmentsParams): Promise<ProfileReferences> {
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

  return prepareProfileReferences(
    profileAttachments.map(({ type, attachment }) => ({
      type,
      attachment,
    })),
  );
}
