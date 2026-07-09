import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { profileChannelVideo } from "@/db/schema";
import type { ProfileChannelVideo } from "@/domains/profiles/schemas/entities/profile-channel-video";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

type GetProfileChannelVideosParams = {
  userId: string;
  profileId: string;
};

export async function getProfileChannelVideos({
  userId,
  profileId,
}: GetProfileChannelVideosParams): Promise<ProfileChannelVideo[]> {
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

  const videos = await db.query.profileChannelVideo.findMany({
    where: eq(profileChannelVideo.profileId, profileId),
    orderBy: [desc(profileChannelVideo.createdAt)],
  });

  return videos as ProfileChannelVideo[];
}
