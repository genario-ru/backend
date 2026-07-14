import { db } from "@/db";
import {
  isSocialKitVideoPlatformSlug,
  type SocialKitVideoPlatformSlug,
} from "@/lib/socialkit/types/video-platform-slug";
import { fetchProfileChannelStats } from "@/lib/socialkit/utils/fetch-profile-channel-stats";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { testString } from "@/shared/utils/regex/test-string";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import type { ResolveProfileChannelResult } from "@/domains/profiles/types/resolve-profile-channel";

type ResolveProfileChannelParams = {
  url: string;
};

export async function resolveProfileChannel({
  url,
}: ResolveProfileChannelParams): Promise<ResolveProfileChannelResult> {
  const foundPlatforms = await db.query.platform.findMany({
    where: (platform, { eq }) => eq(platform.hasAutoImport, true),
  });

  if (foundPlatforms.length === 0) {
    throw throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Platforms not found",
    });
  }

  const platformByUrl = foundPlatforms.find((platform) => {
    if (!platform.urlRegex) {
      return false;
    }

    return testString(platform.urlRegex, url);
  });

  if (!platformByUrl) {
    return {
      status: "error",
      url,
      statusDetails: "Указанная платформа не поддерживается",
    };
  }

  const platformByChannelUrl = foundPlatforms.find((platform) => {
    if (!platform.channelUrlRegex) {
      return false;
    }

    return testString(platform.channelUrlRegex, url);
  });

  if (!platformByChannelUrl) {
    return {
      status: "error",
      url,
      statusDetails: "Указанная ссылка не поддерживается",
    };
  }

  if (!isSocialKitVideoPlatformSlug(platformByChannelUrl.slug)) {
    return {
      status: "error",
      url,
      statusDetails: "Канал не найден",
    };
  }

  const platformSlug: SocialKitVideoPlatformSlug = platformByChannelUrl.slug;

  const stats = await fetchProfileChannelStats({
    url,
    platformSlug,
  }).catch((error) => {
    console.error("Error getting channel stats from SocialKit", {
      platformSlug,
      error,
    });

    return null;
  });

  if (!stats || stats.name.length === 0) {
    return {
      status: "error",
      url,
      statusDetails: "Канал не найден",
    };
  }

  return {
    status: "success",
    data: {
      url,
      platform: platformByUrl,
      stats,
    },
  };
}
