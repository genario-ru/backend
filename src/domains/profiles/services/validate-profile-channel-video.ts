import { db } from "@/db";
import type { platform } from "@/db/schema";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { testString } from "@/shared/utils/regex/test-string";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

type Platform = typeof platform.$inferSelect;

type ValidateProfileChannelVideoParams = {
  url: string;
};

type ValidateProfileChannelVideoResult = {
  url: string;
  platform: Platform;
};

export async function validateProfileChannelVideo({
  url,
}: ValidateProfileChannelVideoParams): Promise<ValidateProfileChannelVideoResult> {
  const foundPlatforms = await db.query.platform.findMany({
    where: (platform, { isNotNull: isNotNullFn }) =>
      isNotNullFn(platform.videoUrlRegex),
  });

  if (foundPlatforms.length === 0) {
    throw throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Платформы для прикрепления видео не найдены",
    });
  }

  const matchedPlatform = foundPlatforms.find((platformItem) => {
    if (!platformItem.videoUrlRegex) {
      return false;
    }

    return testString(platformItem.videoUrlRegex, url);
  });

  if (!matchedPlatform) {
    throw throwAPIError({
      code: APIErrorCode.InvalidInput,
      message:
        "Указанная ссылка не поддерживается. Доступны YouTube, Instagram и TikTok",
    });
  }

  return {
    url,
    platform: matchedPlatform,
  };
}
