import { env } from "@/env";

export function isSentryEnabled() {
  return Boolean(env.GLITCHTIP_DSN) && env.NODE_ENV === "production";
}
