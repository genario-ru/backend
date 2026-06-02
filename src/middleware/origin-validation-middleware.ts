import type { Context } from "hono";
import { createMiddleware } from "hono/factory";

import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import type { AppEnv } from "@/shared/types/server/app-env";
import { getClientIp } from "@/shared/utils/server/get-client-ip";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

type OriginValidationMiddlewareParams = {
  trustedOrigins?: string[];
  trustedIps?: string[];
  skipPaths?: string[];
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, "");
}

function getRequestOrigin(c: Context<AppEnv>) {
  const origin = c.req.header("origin");

  if (origin) {
    return normalizeOrigin(origin);
  }

  const referer = c.req.header("referer");

  if (!referer) {
    return null;
  }

  try {
    return normalizeOrigin(new URL(referer).origin);
  } catch {
    return null;
  }
}

export function originValidationMiddleware({
  trustedOrigins = [],
  trustedIps = [],
  skipPaths = [],
}: OriginValidationMiddlewareParams) {
  const normalizedTrustedOrigins = trustedOrigins.map(normalizeOrigin);
  const trustedIpAllowlist = new Set(trustedIps);

  return createMiddleware<AppEnv>(async (c, next) => {
    if (SAFE_METHODS.has(c.req.method)) {
      return next();
    }

    if (skipPaths.some((path) => c.req.path.startsWith(path))) {
      return next();
    }

    if (trustedIpAllowlist.has(getClientIp(c))) {
      return next();
    }

    const requestOrigin = getRequestOrigin(c);

    if (!requestOrigin || !normalizedTrustedOrigins.includes(requestOrigin)) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "Origin запроса не разрешен",
      });
    }

    return next();
  });
}
