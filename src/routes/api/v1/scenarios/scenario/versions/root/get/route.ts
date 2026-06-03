import { validator } from "hono-openapi";

import { db } from "@/db";
import { getScenarioVersionsParamsSchema } from "@/domains/scenarios/schemas/handlers/get-scenario-versions/params";
import {
  type GetScenarioVersionsResponse,
  getScenarioVersionsResponseSchema,
} from "@/domains/scenarios/schemas/handlers/get-scenario-versions/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const getScenarioVersionsRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/versions",
);

// GET /api/v1/scenarios/{scenarioId}/versions
getScenarioVersionsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-scenario-versions",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario versions retrieved successfully",
        schema: getScenarioVersionsResponseSchema,
      }),
    },
  }),
  validator("param", getScenarioVersionsParamsSchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const user = c.get("user");

    // Проверяем, что сценарий принадлежит пользователю
    const scenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
    });

    if (!scenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Сценарий не найден",
      });
    }

    const versions = await db.query.scenarioVersion.findMany({
      where: (scenarioVersion, { eq }) =>
        eq(scenarioVersion.scenarioId, scenarioId),
      orderBy: (scenarioVersion, { desc }) => [desc(scenarioVersion.createdAt)],
    });

    return c.json<GetScenarioVersionsResponse>(
      getScenarioVersionsResponseSchema.parse({
        data: versions,
      }),
    );
  },
);
