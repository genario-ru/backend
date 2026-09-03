import { createMiddleware } from "hono/factory";

import { env } from "@/env";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const paymentsKillSwitchMiddleware = createMiddleware(
  async (c, next) => {
    if (env.DISABLE_PAYMENTS) {
      throw throwAPIError({
        code: APIErrorCode.ServiceUnavailable,
        message: "Платежи временно недоступны",
      });
    }

    return next();
  },
);
