import { ApiClientError } from "@/lib/api-client";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export function mapSocialKitApiError(error: unknown) {
  if (!(error instanceof ApiClientError)) {
    throw error;
  }

  if (error.status === HTTPStatusCode.NotFound) {
    throw throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Видео не найдено или недоступно",
    });
  }

  if (error.status === HTTPStatusCode.Forbidden) {
    throw throwAPIError({
      code: APIErrorCode.Forbidden,
      message: "Не удалось получить данные видео: превышен лимит SocialKit",
    });
  }

  if (error.status === HTTPStatusCode.BadRequest) {
    throw throwAPIError({
      code: APIErrorCode.InvalidInput,
      message: "Некорректная ссылка на видео",
    });
  }

  throw throwAPIError({
    code: APIErrorCode.InternalServerError,
    message: "Не удалось получить данные видео",
  });
}
