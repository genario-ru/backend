import type { Env, Input } from "hono";
import { type RedisClient, RedisStore, type Store } from "hono-rate-limiter";

import { redis } from "@/lib/redis";

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

export function createRedisRateLimitStore<
  E extends Env = Env,
  P extends string = string,
  I extends Input = Input,
>(prefix: string): Store<E, P, I> {
  return new RedisStore<E, P, I>({
    prefix,
    client: redisRateLimitClient,
  });
}
