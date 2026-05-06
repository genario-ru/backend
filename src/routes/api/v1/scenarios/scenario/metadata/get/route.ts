import { validator } from "hono-openapi";

import { db } from "@/db";
import { getScenarioMetadataParamsSchema } from "@/domains/scenarios/schemas/handlers/get-scenario-metadata/params";
import {
  type GetScenarioMetadataResponse,
  getScenarioMetadataResponseSchema,
} from "@/domains/scenarios/schemas/handlers/get-scenario-metadata/response";
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

export const getScenarioMetadataRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/metadata",
);

// GET /api/v1/scenarios/{scenarioId}/metadata
getScenarioMetadataRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-scenario-metadata",
    windowMs: 60 * 1000,
    limit: 60,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario metadata retrieved successfully",
        schema: getScenarioMetadataResponseSchema,
      }),
    },
  }),
  validator("param", getScenarioMetadataParamsSchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const user = c.get("user");

    const foundScenario = await db.query.scenario.findFirst({
      where: (scenario, { and, eq }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
      with: {
        metadata: {
          with: { platform: true },
          orderBy: (item, { desc }) => [desc(item.createdAt)],
        },
      },
    });

    if (!foundScenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Указанный сценарий не существует или у вас нет к нему доступа",
      });
    }

    return c.json<GetScenarioMetadataResponse>(
      getScenarioMetadataResponseSchema.parse({
        data: {
          status: foundScenario.metadataStatus,
          items: foundScenario.metadata,
        },
      }),
    );
  },
);
