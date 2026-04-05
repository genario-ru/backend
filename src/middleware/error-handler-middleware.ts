import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { prettifyError, ZodError } from "zod";

import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const errorHandlerMiddleware = createMiddleware(async (_c, next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    if (error instanceof ZodError) {
      return throwAPIError({
        code: APIErrorCode.ValidationError,
        details: prettifyError(error),
      });
    }

    return throwAPIError({
      code: APIErrorCode.InternalServerError,
      details: error,
    });
  }
});
