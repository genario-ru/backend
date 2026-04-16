import { validator } from "hono-openapi";

import { db } from "@/db";
import { getProductionStatusesQuerySchema } from "@/domains/production-statuses/handlers/get-production-statuses/query";
import {
  type GetProductionStatusesResponse,
  getProductionStatusesResponseSchema,
} from "@/domains/production-statuses/handlers/get-production-statuses/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getProductionStatusesRoute = createHonoApp().basePath(
  "/production-statuses",
);

// GET /api/v1/production-statuses
getProductionStatusesRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-production-statuses",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Platforms],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Production statuses retrieved successfully",
        schema: getProductionStatusesResponseSchema,
      }),
    },
  }),
  validator("query", getProductionStatusesQuerySchema),
  async (c) => {
    const { entity } = c.req.valid("query");

    const foundProductionStatuses = await db.query.productionStatus.findMany({
      where: (productionStatus, { and, eq }) =>
        and(
          eq(productionStatus.forScenario, entity === "scenario"),
          eq(productionStatus.forScenarioChapter, entity === "scenarioChapter"),
        ),
    });

    return c.json<GetProductionStatusesResponse>(
      getProductionStatusesResponseSchema.parse({
        data: foundProductionStatuses,
      }),
    );
  },
);
