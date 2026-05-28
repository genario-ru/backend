import {
  type GetHealthResponse,
  getHealthResponseSchema,
} from "@/domains/health/schemas/handlers/get-health/response";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

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

    return throwAPIError({
      code: APIErrorCode.InternalServerError,
      details: {
        allOk,
      },
    });

    // return c.json<GetHealthResponse>(
    //   getHealthResponseSchema.parse({
    //     status: allOk ? "ok" : "unhealthy",
    //     checks: { postgres, redis: redisCheck },
    //   }),
    //   status,
    // );
  },
);
