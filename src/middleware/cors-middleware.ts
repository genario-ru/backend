import { cors } from "hono/cors";

import { env } from "@/env";
import { TRUSTED_ORIGINS } from "@/shared/constants/api/trusted-origins";
import { getClientIp } from "@/shared/utils/server/get-client-ip";
import { parseAllowedIps } from "@/shared/utils/server/parse-allowed-ips";

const localDevelopmentIpAllowlist = new Set(
  parseAllowedIps(env.LOCAL_DEVELOPMENT_IPS),
);

export const corsMiddleware = cors({
  origin: (origin, c) => {
    if (TRUSTED_ORIGINS.includes(origin)) {
      return origin;
    }

    if (localDevelopmentIpAllowlist.has(getClientIp(c))) {
      return origin;
    }

    return null;
  },
  maxAge: 600,
  credentials: true,
});
