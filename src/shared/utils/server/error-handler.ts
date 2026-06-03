import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { prettifyError, ZodError } from "zod";

import { captureHonoError } from "@/lib/sentry";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import type { AppEnv } from "@/shared/types/server/app-env";

export function errorHandler(error: Error, c: Context<AppEnv>) {
  console.error(error);

  if (error instanceof HTTPException) {
    if (error.status >= 500) {
      captureHonoError(error, c);
    }

    return error.getResponse();
  }

  if (error instanceof ZodError) {
    return new HTTPException(HTTPStatusCode.BadRequest, {
      message: "Validation Error",
      cause: prettifyError(error),
    }).getResponse();
  }

  captureHonoError(error, c);

  return new HTTPException(HTTPStatusCode.InternalServerError, {
    message: "Internal Server Error",
    cause: error,
  }).getResponse();
}
