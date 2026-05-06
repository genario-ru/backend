import { db } from "@/db";
import {
  type GetAlertsResponse,
  getAlertsResponseSchema,
} from "@/domains/alerts/schemas/handlers/get-alerts/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getAlertsRoute = createHonoApp().basePath("/alerts");

// GET /api/v1/alerts
getAlertsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-alerts",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Alerts],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Active alerts retrieved successfully",
        schema: getAlertsResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundAlerts = await db.query.alert.findMany({
      orderBy: (alert, { desc }) => [
        desc(alert.expiresAt),
        desc(alert.createdAt),
      ],
      where: (alert, { and, eq, gt }) =>
        and(
          eq(alert.status, "active"),
          gt(alert.expiresAt, new Date().toISOString()),
        ),
    });

    return c.json<GetAlertsResponse>(
      getAlertsResponseSchema.parse({
        data: foundAlerts,
      }),
    );
  },
);
