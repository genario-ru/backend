import { rateLimiter } from "hono-rate-limiter";

import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import type { AppEnv } from "@/shared/types/server/app-env";
import { createRedisRateLimitStore } from "@/shared/utils/server/create-redis-rate-limit-store";
import { getClientIp } from "@/shared/utils/server/get-client-ip";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

type RateLimitMiddlewareParams = {
  keyPrefix: string;
  windowMs: number;
  limit: number;
  message?: string;
};

export function rateLimitMiddleware({
  keyPrefix,
  windowMs,
  limit,
  message = "Слишком много запросов. Попробуйте позже",
}: RateLimitMiddlewareParams) {
  return rateLimiter<AppEnv>({
    windowMs,
    limit,
    keyGenerator: (c) => {
      const userId = c.get("user")?.id;
      const clientIp = getClientIp(c);

      const clientIdentifier = userId
        ? `ip:${clientIp}:user:${userId}`
        : `ip:${clientIp}`;

      return `${keyPrefix}:${clientIdentifier}`;
    },
    handler: () =>
      throwAPIError({
        code: APIErrorCode.TooManyRequests,
        message,
      }),
    store: createRedisRateLimitStore("product-api-rate-limit:"),
  });
}
