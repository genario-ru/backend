import { getUserProfile as getRuTubeUserProfile } from "@/codegen/api/rutube/clients";
import { db } from "@/db";
import type { ProfileChannelUrlValidation } from "@/domains/profiles/schemas/entities/profile-channel-url-validation";
import { extractRuTubeChannelIdentifier } from "@/lib/rutube";
import {
  extractYouTubeChannelIdentifier,
  getYouTubeChannel,
} from "@/lib/youtube";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { testString } from "@/utils/shared/regex/test-string";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export async function validateProfileChannel(
  url: string,
): Promise<ProfileChannelUrlValidation> {
  const foundPlatforms = await db.query.platform.findMany({
    where: (platform, { eq }) => eq(platform.hasAutoImport, true),
  });

  if (foundPlatforms.length === 0) {
    throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Platforms not found",
    });
  }

  const platformByUrl = foundPlatforms.find((platform) => {
    if (!platform.urlRegex) return false;

    return testString(platform.urlRegex, url);
  });

  if (!platformByUrl) {
    return {
      url,
      status: "error",
      statusDetails: "Указанная платформа не поддерживается",
      platform: null,
    };
  }

  const platformByChannelUrl = foundPlatforms.find((platform) => {
    if (!platform.channelUrlRegex) return false;

    return testString(platform.channelUrlRegex, url);
  });

  if (!platformByChannelUrl) {
    return {
      url,
      status: "error",
      statusDetails: "Указанная ссылка не поддерживается",
      platform: null,
    };
  }

  const channelExists = await checkChannelExists(
    url,
    platformByChannelUrl.slug,
  );

  if (!channelExists) {
    return {
      url,
      status: "error",
      statusDetails: "Канал не найден",
      platform: null,
    };
  }

  return {
    url,
    status: "success",
    statusDetails: "Канал найден",
    platform: platformByUrl,
  };
}

async function checkChannelExists(
  url: string,
  platformSlug: string,
): Promise<boolean> {
  switch (platformSlug) {
    case "youtube":
      const youTubeIdentifier = extractYouTubeChannelIdentifier(url);

      if (!youTubeIdentifier) return false;

      const youTubeChannel = await getYouTubeChannel(youTubeIdentifier).catch(
        (error) => {
          console.error("Error getting YouTube channel", error);
          return null;
        },
      );

      return youTubeChannel !== null;

    case "rutube":
      const identifier = extractRuTubeChannelIdentifier(url);

      if (!identifier) return false;

      const ruTubeChannel = await getRuTubeUserProfile({
        author_id: identifier.authorId,
      }).catch((error) => {
        console.error("Error getting RuTube channel", error);
        return null;
      });

      return ruTubeChannel !== null;

    default:
      return false;
  }
}
