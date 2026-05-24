import type { Registry } from "prom-client";

import { env } from "@/env";
import { metricsRegistry } from "@/middleware/http-metrics-middleware";
import { ipAllowlistMiddleware } from "@/middleware/ip-allowlist-middleware";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { parseAllowedIps } from "@/shared/utils/server/parse-allowed-ips";

const registry: Registry = metricsRegistry;
const allowedIps = parseAllowedIps(env.METRICS_ALLOWED_IPS);

export const metricsRoute = createHonoApp().basePath("/metrics");

metricsRoute.get("/", ipAllowlistMiddleware({ allowedIps }), async (c) => {
  c.header("Content-Type", registry.contentType);

  return c.body(await registry.metrics());
});
