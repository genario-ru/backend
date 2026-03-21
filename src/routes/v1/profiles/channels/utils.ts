import { db } from "@/db";
import { APIErrorCode } from "@/schemas/common/api-error";
import type { ProfileChannelUrlValidation } from "@/schemas/entities/profiles/entities/profile-channel-url-validation";
import { throwAPIError } from "@/utils/server/throw-api-error";

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
    if (!platform.urlRegex) {
      return false;
    }

    // eslint-disable-next-line security/detect-non-literal-regexp
    return new RegExp(platform.urlRegex).test(url);
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
    if (!platform.channelUrlRegex) {
      return false;
    }

    // eslint-disable-next-line security/detect-non-literal-regexp
    return new RegExp(platform.channelUrlRegex).test(url);
  });

  if (!platformByChannelUrl) {
    return {
      url,
      status: "error",
      statusDetails: "Указанная ссылка не поддерживается",
      platform: null,
    };
  }

  // TODO: Добавить отправку запроса к API платформы для получения информации о канале

  return {
    url,
    status: "success",
    statusDetails: "Корректный формат ссылки",
    platform: platformByUrl,
  };
}
