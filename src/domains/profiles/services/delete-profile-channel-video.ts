import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profileChannelVideo } from "@/db/schema";
import type { ProfileChannelVideo } from "@/domains/profiles/schemas/entities/profile-channel-video";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

type DeleteProfileChannelVideoParams = {
  userId: string;
  profileChannelVideoId: string;
};

export async function deleteProfileChannelVideo({
  userId,
  profileChannelVideoId,
}: DeleteProfileChannelVideoParams): Promise<ProfileChannelVideo> {
  const foundVideo = await db.query.profileChannelVideo.findFirst({
    where: (video, { eq: eqFn }) => eqFn(video.id, profileChannelVideoId),
    with: {
      profile: true,
    },
  });

  if (!foundVideo) {
    throw throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Видео канала профиля не найдено",
    });
  }

  if (foundVideo.profile.userId !== userId) {
    throw throwAPIError({
      code: APIErrorCode.Forbidden,
      message: "У вас нет доступа к этому видео",
    });
  }

  const [deletedVideo] = await db
    .delete(profileChannelVideo)
    .where(eq(profileChannelVideo.id, profileChannelVideoId))
    .returning();

  return deletedVideo;
}
