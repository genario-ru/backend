import { db } from "@/db";
import type { ProfileChannelUrlValidation } from "@/domains/profiles/schemas/entities/profile-channel-url-validation";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { testString } from "@/shared/utils/regex/test-string";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import { checkProfileChannelExists } from "./check-profile-channel-exists";

type ValidateProfileChannelParams = {
  url: string;
};

export async function validateProfileChannel({
  url,
}: ValidateProfileChannelParams): Promise<ProfileChannelUrlValidation> {
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

  const channelExists = await checkProfileChannelExists({
    url,
    platformSlug: platformByChannelUrl.slug,
  });

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
