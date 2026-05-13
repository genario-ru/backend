import type { Context } from "hono";

import type { AppEnv } from "@/shared/types/server/app-env";

function normalizeIp(ip: string) {
  if (ip.startsWith("::ffff:")) {
    return ip.slice("::ffff:".length);
  }

  return ip;
}

export function getClientIp(c: Context<AppEnv>) {
  const remoteAddress = c.env.incoming?.socket?.remoteAddress;

  if (!remoteAddress) {
    return "unknown";
  }

  return normalizeIp(remoteAddress.trim());
}
