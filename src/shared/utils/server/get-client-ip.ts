import type { Context } from "hono";

import { env } from "@/env";
import type { AppEnv } from "@/shared/types/server/app-env";

function normalizeIp(ip: string) {
  if (ip.startsWith("::ffff:")) {
    return ip.slice("::ffff:".length);
  }

  return ip;
}

/**
 * Extracts the real client IP from the request, accounting for reverse proxies.
 *
 * Behind Traefik (Dokploy), the socket `remoteAddress` is always the proxy's
 * internal Docker network IP. The real client IP is in `X-Forwarded-For`,
 * where each proxy appends the connecting client's IP to the right.
 *
 * With `TRUSTED_PROXY_COUNT = N`, the algorithm picks the Nth IP from the
 * right in X-Forwarded-For — that's the first untrusted (i.e. real client) IP.
 *
 * Example with Traefik only (count = 1):
 *   XFF: "client-ip"           → returns "client-ip"
 *   XFF: "spoofed, client-ip"  → returns "client-ip"
 *
 * Example with Cloudflare + Traefik (count = 2):
 *   XFF: "client-ip, cf-ip"    → returns "client-ip"
 */
export function getClientIp(c: Context<AppEnv>) {
  const trustedProxyCount = env.TRUSTED_PROXY_COUNT;
  const xForwardedFor = c.req.header("x-forwarded-for");

  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    const clientIndex = ips.length - trustedProxyCount;
    const clientIp = ips[Math.max(0, clientIndex)];

    if (clientIp) {
      return normalizeIp(clientIp);
    }
  }

  const xRealIp = c.req.header("x-real-ip");

  if (xRealIp) {
    return normalizeIp(xRealIp.trim());
  }

  const remoteAddress = c.env.incoming?.socket?.remoteAddress;

  if (!remoteAddress) {
    return "unknown";
  }

  return normalizeIp(remoteAddress.trim());
}
