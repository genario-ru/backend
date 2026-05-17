import { isAPIError } from "better-auth/api";

import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

type ThrowAuthAPIErrorParams = {
  error: unknown;
  fallbackMessage: string;
};

export function throwAuthAPIError({
  error,
  fallbackMessage,
}: ThrowAuthAPIErrorParams) {
  if (isAPIError(error)) {
    switch (error.status) {
      case 400:
        return throwAPIError({
          code: APIErrorCode.InvalidInput,
          message: error.message,
          details: error.body,
        });

      case 401:
        return throwAPIError({
          code: APIErrorCode.Unauthorized,
          message: error.message,
          details: error.body,
        });

      case 403:
        return throwAPIError({
          code: APIErrorCode.Forbidden,
          message: error.message,
          details: error.body,
        });

      case 404:
        return throwAPIError({
          code: APIErrorCode.NotFound,
          message: error.message,
          details: error.body,
        });

      case 409:
      case 422:
        return throwAPIError({
          code: APIErrorCode.ResourceExists,
          message: error.message,
          details: error.body,
        });

      case 429:
        return throwAPIError({
          code: APIErrorCode.TooManyRequests,
          message: error.message,
          details: error.body,
        });

      default:
        return throwAPIError({
          code: APIErrorCode.InternalServerError,
          message: error.message || fallbackMessage,
          details: error.body,
        });
    }
  }

  return throwAPIError({
    code: APIErrorCode.InternalServerError,
    message: fallbackMessage,
    details: error,
  });
}
