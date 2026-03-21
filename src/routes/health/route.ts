import { HTTPStatusCode } from "@/constants/common/http-status-code";
import {
  type GetHealthResponse,
  getHealthResponseSchema,
} from "@/schemas/entities/health/handlers/get-health/response";
import { createHonoApp } from "@/utils/server/create-hono-app";

import { probePostgres, probeRedis } from "./utils";

export const healthRoute = createHonoApp().basePath("/health");

// GET /health
healthRoute.get("/", async (c) => {
  const [postgres, redisCheck] = await Promise.all([
    probePostgres(),
    probeRedis(),
  ]);

  const allOk = postgres.status === "ok" && redisCheck.status === "ok";
  const status = allOk ? HTTPStatusCode.Ok : HTTPStatusCode.ServiceUnavailable;

  return c.json<GetHealthResponse>(
    getHealthResponseSchema.parse({
      status: allOk ? "ok" : "unhealthy",
      checks: { postgres, redis: redisCheck },
    }),
    status,
  );
});
