import { type Env } from "hono";
import { rateLimiter, type RedisClient, RedisStore } from "hono-rate-limiter";

import { type AuthType } from "@/auth";
import { redis } from "@/lib/redis";
import { APIErrorCode } from "@/schemas/common/api-error";
import { throwAPIError } from "@/utils/server/throw-api-error";

type GetClientIdentifierParams = {
  userId: string | undefined;
  forwardedFor: string | undefined;
  realIp: string | undefined;
};

type RateLimitMiddlewareParams = {
  keyPrefix: string;
  windowMs: number;
  limit: number;
  message?: string;
};

type RateLimitMiddlewareEnv = Env & {
  Variables: Partial<AuthType>;
};

function getClientIdentifier({
  userId,
  forwardedFor,
  realIp,
}: GetClientIdentifierParams) {
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return userId ?? forwardedIp ?? realIp ?? "anonymous";
}

const evalsha = ((sha1, keys, args) =>
  redis.evalsha(
    sha1,
    keys.length,
    ...keys,
    ...(args as Array<string | number | Buffer>),
  )) as RedisClient["evalsha"];

const redisRateLimitClient: RedisClient = {
  async scriptLoad(script) {
    const result = await redis.script("LOAD", script);

    if (typeof result !== "string") {
      throw new TypeError("Unexpected redis script load reply");
    }

    return result;
  },
  evalsha,
  decr: (key) => redis.decr(key),
  del: (key) => redis.del(key),
};

export function rateLimitMiddleware({
  keyPrefix,
  windowMs,
  limit,
  message = "Слишком много запросов. Попробуйте позже",
}: RateLimitMiddlewareParams) {
  return rateLimiter<RateLimitMiddlewareEnv>({
    windowMs,
    limit,
    keyGenerator: (c) => {
      const userId = c.get("user")?.id;
      const forwardedFor = c.req.header("x-forwarded-for");
      const realIp = c.req.header("x-real-ip");

      const clientIdentifier = getClientIdentifier({
        userId,
        forwardedFor,
        realIp,
      });

      return `${keyPrefix}:${clientIdentifier}`;
    },
    handler: () =>
      throwAPIError({
        code: APIErrorCode.TooManyRequests,
        message,
      }),
    store: new RedisStore({
      prefix: "product-api-rate-limit:",
      client: redisRateLimitClient,
    }),
  });
}
