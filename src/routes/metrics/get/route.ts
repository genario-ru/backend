import type { Registry } from "prom-client";

import { env } from "@/env";
import { metricsRegistry } from "@/middleware/http-metrics-middleware";
import { ipAllowlistMiddleware } from "@/middleware/ip-allowlist-middleware";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { parseIpAllowlist } from "@/shared/utils/server/ip-allowlist";

const registry: Registry = metricsRegistry;
const allowedIps = parseIpAllowlist(env.METRICS_ALLOWED_IPS);

export const metricsRoute = createHonoApp().basePath("/metrics");

metricsRoute.get("/", ipAllowlistMiddleware({ allowedIps }), async (c) => {
  c.header("Content-Type", registry.contentType);

  return c.body(await registry.metrics());
});
