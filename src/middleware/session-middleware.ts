import { createMiddleware } from "hono/factory";

import { auth, type AuthType } from "@/auth";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const sessionMiddleware = createMiddleware<{ Variables: AuthType }>(
  async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      return throwAPIError({
        code: APIErrorCode.Unauthorized,
        message: "You have to authenticate to access this resource",
      });
    }

    c.set("user", session.user);
    c.set("session", session.session);

    return next();
  },
);
