import { createMiddleware } from "hono/factory";

import { type AuthType } from "@/auth";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const adminMiddleware = createMiddleware<{ Variables: AuthType }>(
  async (c, next) => {
    const user = c.get("user");

    if (user.role !== "admin") {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "Доступ к данному ресурсу разрешен только администраторам",
      });
    }

    return next();
  },
);
