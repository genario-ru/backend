import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenarioVersion } from "@/db/schema";
import { getScenarioParamsSchema } from "@/domains/scenarios/schemas/handlers/get-scenario/params";
import { getScenarioQuerySchema } from "@/domains/scenarios/schemas/handlers/get-scenario/query";
import {
  type GetScenarioResponse,
  getScenarioResponseSchema,
} from "@/domains/scenarios/schemas/handlers/get-scenario/response";
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

export const getScenarioRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId",
);

// GET /api/v1/scenarios/{scenarioId}
getScenarioRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-scenario",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario retrieved successfully",
        schema: getScenarioResponseSchema,
      }),
    },
  }),
  validator("param", getScenarioParamsSchema),
  validator("query", getScenarioQuerySchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const { versionId } = c.req.valid("query");
    const user = c.get("user");

    const foundScenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
      with: {
        profile: true,
        template: true,
        platform: true,
        videoType: true,
        videoDuration: true,
        productionStatus: true,
        scenarioToTone: {
          with: { tone: true },
        },
      },
    });

    if (!foundScenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный сценарий не существует или у вас нет возможности просматривать его",
      });
    }

    const scenarioVersionQueryWhereConditions = [
      eq(scenarioVersion.scenarioId, scenarioId),
    ];

    if (versionId) {
      scenarioVersionQueryWhereConditions.push(
        eq(scenarioVersion.id, versionId),
      );
    }

    const foundScenarioVersion = await db.query.scenarioVersion.findFirst({
      orderBy: (version, { desc }) => desc(version.createdAt),
      where: and(...scenarioVersionQueryWhereConditions),
    });

    if (versionId && !foundScenarioVersion) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Данная версия сценария не существует",
      });
    }

    const { scenarioToTone, ...scenario } = foundScenario;

    return c.json<GetScenarioResponse>(
      getScenarioResponseSchema.parse({
        data: {
          ...scenario,
          currentVersion: foundScenarioVersion,
          tones: scenarioToTone.map(({ tone }) => tone),
        },
      }),
    );
  },
);
