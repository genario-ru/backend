import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { prettifyError, ZodError } from "zod";

import { captureHonoError } from "@/lib/sentry";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const errorHandlerMiddleware = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      if (error.status >= 500) {
        captureHonoError(error, c);
      }

      throw error;
    }

    if (error instanceof ZodError) {
      return throwAPIError({
        code: APIErrorCode.ValidationError,
        details: prettifyError(error),
      });
    }

    captureHonoError(error, c);

    return throwAPIError({
      code: APIErrorCode.InternalServerError,
      details: error,
    });
  }
});
