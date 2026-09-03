import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenarioVersion } from "@/db/schema";
import { getScenarioCurrentVersionParamsSchema } from "@/domains/scenarios/schemas/handlers/get-scenario-current-version/params";
import { getScenarioCurrentVersionQuerySchema } from "@/domains/scenarios/schemas/handlers/get-scenario-current-version/query";
import {
  type GetScenarioCurrentVersionResponse,
  getScenarioCurrentVersionResponseSchema,
} from "@/domains/scenarios/schemas/handlers/get-scenario-current-version/response";
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

export const getScenarioCurrentVersionRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/current-version",
);

// GET /api/v1/scenarios/{scenarioId}/current-version
getScenarioCurrentVersionRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-scenario-current-version",
    windowMs: 1000,
    limit: 2,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario current version retrieved successfully",
        schema: getScenarioCurrentVersionResponseSchema,
      }),
    },
  }),
  validator("param", getScenarioCurrentVersionParamsSchema),
  validator("query", getScenarioCurrentVersionQuerySchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const { versionId } = c.req.valid("query");
    const user = c.get("user");

    const scenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
    });

    if (!scenario) {
      throw throwAPIError({
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
      orderBy: (scenarioVersion, { desc }) => [desc(scenarioVersion.createdAt)],
      where: and(...scenarioVersionQueryWhereConditions),
      with: {
        scenario: {
          with: {
            profile: true,
            videoType: true,
            videoDuration: true,
            scenarioToPlatform: {
              with: { platform: true },
            },
            scenarioToTone: {
              with: { tone: true },
            },
          },
        },
        chapters: {
          orderBy: (scenarioChapter, { asc }) => [
            asc(scenarioChapter.startTime),
          ],
        },
      },
    });

    if (!foundScenarioVersion) {
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Версия сценария не найдена",
      });
    }

    const { scenarioToPlatform, scenarioToTone, ...scenarioData } =
      foundScenarioVersion.scenario;
    const { scenario: _scenario, ...versionData } = foundScenarioVersion;

    return c.json<GetScenarioCurrentVersionResponse>(
      getScenarioCurrentVersionResponseSchema.parse({
        data: {
          ...versionData,
          profile: scenarioData.profile,
          platforms: scenarioToPlatform.map((item) => item.platform),
          videoType: scenarioData.videoType,
          videoDuration: scenarioData.videoDuration,
          tones: scenarioToTone.map((item) => item.tone),
          scenarioChapters: versionData.chapters,
        },
      }),
    );
  },
);
