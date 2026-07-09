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
        throw throwAPIError({
          code: APIErrorCode.InvalidInput,
          message: error.message,
          details: error.body,
        });

      case 401:
        throw throwAPIError({
          code: APIErrorCode.Unauthorized,
          message: error.message,
          details: error.body,
        });

      case 403:
        throw throwAPIError({
          code: APIErrorCode.Forbidden,
          message: error.message,
          details: error.body,
        });

      case 404:
        throw throwAPIError({
          code: APIErrorCode.NotFound,
          message: error.message,
          details: error.body,
        });

      case 409:
      case 422:
        throw throwAPIError({
          code: APIErrorCode.ResourceExists,
          message: error.message,
          details: error.body,
        });

      case 429:
        throw throwAPIError({
          code: APIErrorCode.TooManyRequests,
          message: error.message,
          details: error.body,
        });

      default:
        throw throwAPIError({
          code: APIErrorCode.InternalServerError,
          message: error.message || fallbackMessage,
          details: error.body,
        });
    }
  }

  throw throwAPIError({
    code: APIErrorCode.InternalServerError,
    message: fallbackMessage,
    details: error,
  });
}
