import Redis from "ioredis";

import { envs } from "@/constants/shared/common/envs";

export const redis = new Redis(envs.REDIS_URL, {
  maxRetriesPerRequest: null,
});
