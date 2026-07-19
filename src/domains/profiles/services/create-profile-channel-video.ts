import { db } from "@/db";
import { profileChannelVideo } from "@/db/schema";
import type { ProfileChannelVideo } from "@/domains/profiles/schemas/entities/profile-channel-video";
import { isSocialKitVideoPlatformSlug } from "@/lib/socialkit/types/video-platform-slug";
import { fetchProfileChannelVideoStats } from "@/lib/socialkit/utils/fetch-profile-channel-video-stats";
import { enqueueProfileChannelVideoImport } from "@/mq/profile-channel-video-import/queue";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import { validateProfileChannelVideo } from "./validate-profile-channel-video";

type CreateProfileChannelVideoParams = {
  userId: string;
  profileId: string;
  url: string;
};

export async function createProfileChannelVideo({
  userId,
  profileId,
  url,
}: CreateProfileChannelVideoParams): Promise<ProfileChannelVideo> {
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

  const { platform } = await validateProfileChannelVideo({ url });

  const slug = platform.slug;

  if (!isSocialKitVideoPlatformSlug(slug)) {
    throw throwAPIError({
      code: APIErrorCode.InvalidInput,
      message: "Платформа не поддерживается для импорта видео",
    });
  }

  const stats = await fetchProfileChannelVideoStats({
    url,
    platformSlug: slug,
  });

  const [createdVideo] = await db
    .insert(profileChannelVideo)
    .values({
      profileId,
      platformId: platform.id,
      profileChannelId: null,
      externalId: stats.externalId,
      url: stats.url,
      thumbnailUrl: stats.thumbnailUrl,
      name: stats.name,
      description: stats.description,
      likes: stats.likes,
      views: stats.views,
      comments: stats.comments,
      duration: stats.duration,
    })
    .returning();

  await enqueueProfileChannelVideoImport({
    profileChannelVideoId: createdVideo.id,
    url: stats.url,
    platformSlug: slug,
  });

  return createdVideo;
}
