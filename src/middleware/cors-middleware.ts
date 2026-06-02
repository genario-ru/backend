import { cors } from "hono/cors";

import { env } from "@/env";
import { TRUSTED_ORIGINS } from "@/shared/constants/api/trusted-origins";
import { getClientIp } from "@/shared/utils/server/get-client-ip";
import {
  createIpAllowlistMatcher,
  parseIpAllowlist,
} from "@/shared/utils/server/ip-allowlist";

const isLocalDevelopmentIp = createIpAllowlistMatcher(
  parseIpAllowlist(env.LOCAL_DEVELOPMENT_IPS),
);

export const corsMiddleware = cors({
  origin: (origin, c) => {
    if (TRUSTED_ORIGINS.includes(origin)) {
      return origin;
    }

    if (isLocalDevelopmentIp(getClientIp(c))) {
      return origin;
    }

    return null;
  },
  maxAge: 600,
  credentials: true,
});
