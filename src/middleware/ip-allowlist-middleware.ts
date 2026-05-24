import { createMiddleware } from "hono/factory";

import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import type { AppEnv } from "@/shared/types/server/app-env";
import { getClientIp } from "@/shared/utils/server/get-client-ip";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

type IpAllowlistMiddlewareParams = {
  allowedIps: string[];
};

export function ipAllowlistMiddleware({
  allowedIps,
}: IpAllowlistMiddlewareParams) {
  const allowlist = new Set(allowedIps);

  return createMiddleware<AppEnv>(async (c, next) => {
    const clientIp = getClientIp(c);

    if (!allowlist.has(clientIp)) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "Access to this resource is forbidden",
      });
    }

    return next();
  });
}
