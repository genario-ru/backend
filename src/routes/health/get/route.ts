import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import {
  type GetHealthResponse,
  getHealthResponseSchema,
} from "@/domains/health/schemas/handlers/get-health/response";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

import { probePostgres, probeRedis } from "./utils";

export const healthRoute = createHonoApp().basePath("/health");

// GET /health
healthRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "health",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  async (c) => {
    const [postgres, redisCheck] = await Promise.all([
      probePostgres(),
      probeRedis(),
    ]);

    const allOk = postgres.status === "ok" && redisCheck.status === "ok";
    const status = allOk
      ? HTTPStatusCode.Ok
      : HTTPStatusCode.ServiceUnavailable;

    return c.json<GetHealthResponse>(
      getHealthResponseSchema.parse({
        status: allOk ? "ok" : "unhealthy",
        checks: { postgres, redis: redisCheck },
      }),
      status,
    );
  },
);
