import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { matchedRoutes } from "hono/route";
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from "prom-client";

import type { AppEnv } from "@/shared/types/server/app-env";

export const BULL_BOARD_METRICS_PATH = "/admin/ewf89-23aE3_93/queues";

const METRIC_PATHS_TO_SKIP = new Set([
  "/metrics",
  "/health",
  "/api/open-api",
  "/api/docs",
]);

function getMetricsRouteLabel(routePath: string) {
  return routePath || "unmatched";
}

function getStatusClassLabel(statusCode: number) {
  return `${Math.floor(statusCode / 100)}xx`;
}

function shouldSkipHttpMetrics(path: string) {
  if (METRIC_PATHS_TO_SKIP.has(path)) {
    return true;
  }

  return path.startsWith(BULL_BOARD_METRICS_PATH);
}

function resolveRoutePath(c: Context<AppEnv>) {
  const route = matchedRoutes(c).at(-1)?.path ?? c.req.routePath;

  return getMetricsRouteLabel(route);
}

export const metricsRegistry = new Registry();

collectDefaultMetrics({
  prefix: "genario_",
  register: metricsRegistry,
});

const httpRequestsTotal = new Counter({
  name: "genario_http_requests_total",
  help: "Total number of HTTP requests handled by the API",
  labelNames: ["method", "route", "status_class"] as const,
  registers: [metricsRegistry],
});

const httpRequestDurationSeconds = new Histogram({
  name: "genario_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_class"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry],
});

const httpRequestsInFlight = new Gauge({
  name: "genario_http_requests_in_flight",
  help: "Current number of in-flight HTTP requests",
  labelNames: ["method", "route"] as const,
  registers: [metricsRegistry],
});

export const httpMetricsMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    if (shouldSkipHttpMetrics(c.req.path)) {
      return next();
    }

    const method = c.req.method;
    const route = resolveRoutePath(c);
    const startedAt = performance.now();

    httpRequestsInFlight.inc({ method, route });

    try {
      await next();
    } finally {
      const statusClass = getStatusClassLabel(c.res.status);
      const durationSeconds = (performance.now() - startedAt) / 1000;

      httpRequestsInFlight.dec({ method, route });
      httpRequestsTotal.inc({ method, route, status_class: statusClass });
      httpRequestDurationSeconds.observe(
        { method, route, status_class: statusClass },
        durationSeconds,
      );
    }
  },
);
